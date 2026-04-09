// ==UserScript==
// @name         JavStash Browser Lookup
// @namespace    https://javstash.vercel.app/
// @version      0.1.0
// @description  在 JavBus 和 JavDB 页面中查询 JavStash 标题与简介
// @match        https://www.javbus.com/*
// @match        https://javdb.com/*
// @match        https://www.javdb.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// @connect      javstash.vercel.app
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'javstash_api_key';
  const PROXY_ORIGIN = 'http://localhost:3456';
  const LOOKUP_PATH = '/api/browser/lookup';
  const BUTTON_CLASS = 'javstash-lookup-button';
  const PANEL_ID = 'javstash-lookup-panel';
  const DEBUG_BADGE_ID = 'javstash-debug-badge';

  function normalizeSceneCode(code) {
    return String(code || '').trim().toUpperCase();
  }

  function extractJavbusCode(url) {
    const match = String(url).match(/^https?:\/\/www\.javbus\.com\/([A-Za-z0-9]{2,10}-\d{2,6})\/?$/i);
    return match ? normalizeSceneCode(match[1]) : null;
  }

  function isJavdbDetailUrl(url) {
    return /^https?:\/\/(?:www\.)?javdb\.com\/v\/[A-Za-z0-9]+(?:[/?#].*)?$/i.test(String(url));
  }

  function extractCodeFromText(text) {
    const match = String(text || '').match(/\b([A-Za-z0-9]{2,10}-\d{2,6})\b/);
    return match ? normalizeSceneCode(match[1]) : null;
  }

  function findJavdbCodeValueElement() {
    const blocks = Array.from(document.querySelectorAll('.video-detail .movie-panel-info .panel-block'));
    for (const block of blocks) {
      const label = block.querySelector('strong');
      if (!label) {
        continue;
      }

      const labelText = String(label.textContent || '').trim();
      if (labelText !== '番號:' && labelText !== '番号:' && labelText !== '番号') {
        continue;
      }

      const value = block.querySelector('.value');
      if (value) {
        return value;
      }
    }

    return null;
  }

  function extractJavdbCodeFromPage() {
    const value = findJavdbCodeValueElement();
    if (!value) {
      return null;
    }

    return extractCodeFromText(value.textContent || '');
  }

  function buildLookupUrl(code) {
    const url = new URL(LOOKUP_PATH, PROXY_ORIGIN);
    url.searchParams.set('code', normalizeSceneCode(code));
    return url.toString();
  }

  function getApiKey() {
    return String(GM_getValue(STORAGE_KEY, '') || '').trim();
  }

  function renderDebugBadge(message, background) {
    let badge = document.getElementById(DEBUG_BADGE_ID);
    if (!badge) {
      badge = document.createElement('div');
      badge.id = DEBUG_BADGE_ID;
      badge.style.position = 'fixed';
      badge.style.top = '12px';
      badge.style.left = '12px';
      badge.style.zIndex = '2147483647';
      badge.style.padding = '8px 12px';
      badge.style.borderRadius = '999px';
      badge.style.fontSize = '12px';
      badge.style.fontWeight = '700';
      badge.style.color = '#fff';
      badge.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
      document.body.appendChild(badge);
    }

    badge.style.background = background || '#111';
    badge.textContent = message;
  }

  function registerMenu() {
    GM_registerMenuCommand('设置 JavStash ApiKey', () => {
      const current = getApiKey();
      const next = window.prompt('请输入 JavStash ApiKey', current);
      if (typeof next === 'string') {
        GM_setValue(STORAGE_KEY, next.trim());
      }
    });

    GM_registerMenuCommand('清除 JavStash ApiKey', () => {
      GM_setValue(STORAGE_KEY, '');
      window.alert('已清除 JavStash ApiKey');
    });
  }

  function detectCode() {
    if (isJavdbDetailUrl(window.location.href)) {
      return extractJavdbCodeFromPage() || extractCodeFromText(document.body.innerText || '');
    }

    return extractJavbusCode(window.location.href) || extractCodeFromText(document.body.innerText || '');
  }

  function findInjectionTarget(code) {
    if (isJavdbDetailUrl(window.location.href)) {
      const value = findJavdbCodeValueElement();
      if (value && normalizeSceneCode(value.textContent || '').includes(code)) {
        return value;
      }
    }

    const infoParagraphs = Array.from(document.querySelectorAll('.info p'));
    for (const paragraph of infoParagraphs) {
      const label = paragraph.querySelector('span.header');
      if (!label) {
        continue;
      }

      const labelText = String(label.textContent || '').trim();
      if (labelText !== '識別碼:' && labelText !== '识别码:' && labelText !== '識別碼') {
        continue;
      }

      const spans = Array.from(paragraph.querySelectorAll('span'));
      const codeSpan = spans.find((span) => normalizeSceneCode(span.textContent || '') === code);
      if (codeSpan) {
        return codeSpan;
      }
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = String(node.textContent || '');
        if (!text || !text.includes(code)) {
          return NodeFilter.FILTER_SKIP;
        }
        const parent = node.parentElement;
        if (!parent) {
          return NodeFilter.FILTER_SKIP;
        }
        const tagName = parent.tagName;
        if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT') {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNode = walker.nextNode();
    return textNode ? textNode.parentElement : null;
  }

  function ensurePanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) {
      return panel;
    }

    panel = document.createElement('aside');
    panel.id = PANEL_ID;
    panel.style.position = 'fixed';
    panel.style.right = '24px';
    panel.style.bottom = '24px';
    panel.style.width = '360px';
    panel.style.maxWidth = 'calc(100vw - 32px)';
    panel.style.maxHeight = '70vh';
    panel.style.overflow = 'auto';
    panel.style.zIndex = '2147483647';
    panel.style.background = '#fff';
    panel.style.color = '#111';
    panel.style.border = '1px solid rgba(0, 0, 0, 0.18)';
    panel.style.borderRadius = '14px';
    panel.style.boxShadow = '0 18px 50px rgba(0, 0, 0, 0.24)';
    panel.style.padding = '16px';
    panel.style.fontSize = '14px';
    panel.style.lineHeight = '1.6';
    panel.style.display = 'none';

    document.body.appendChild(panel);
    return panel;
  }

  function renderPanel(state) {
    const panel = ensurePanel();
    panel.innerHTML = '';
    panel.style.display = 'block';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';

    const title = document.createElement('strong');
    title.textContent = state.code ? 'JavStash 查询' : 'JavStash';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭';
    closeButton.style.border = '0';
    closeButton.style.background = 'transparent';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function () {
      panel.style.display = 'none';
    };
    header.appendChild(closeButton);
    panel.appendChild(header);

    const body = document.createElement('div');
    panel.appendChild(body);

    if (state.state === 'loading') {
      body.textContent = '正在查询标题和简介...';
      return;
    }

    if (state.state === 'missing-key') {
      body.textContent = '尚未配置 JavStash ApiKey，请从油猴菜单中完成设置。';
      return;
    }

    if (state.state === 'error') {
      body.textContent = state.message || '查询失败，请稍后重试。';
      return;
    }

    const codeLine = document.createElement('div');
    codeLine.style.marginBottom = '10px';
    codeLine.innerHTML = '<strong>番号：</strong>';
    codeLine.appendChild(document.createTextNode(state.code || '-'));
    body.appendChild(codeLine);

    const titleBlock = document.createElement('div');
    titleBlock.style.marginBottom = '12px';
    const titleLabel = document.createElement('strong');
    titleLabel.textContent = '标题';
    titleBlock.appendChild(titleLabel);
    const titleText = document.createElement('div');
    titleText.style.marginTop = '6px';
    titleText.textContent = state.title || '暂无标题';
    titleBlock.appendChild(titleText);
    body.appendChild(titleBlock);

    const descBlock = document.createElement('div');
    const descLabel = document.createElement('strong');
    descLabel.textContent = '简介';
    descBlock.appendChild(descLabel);
    const descText = document.createElement('div');
    descText.style.marginTop = '6px';
    descText.textContent = state.description || '暂无简介';
    descBlock.appendChild(descText);
    body.appendChild(descBlock);
  }

  function requestLookup(code, apiKey) {
    return new Promise((resolve, reject) => {
      const requestUrl = buildLookupUrl(code);
      console.log('[JavStash] request lookup', {
        url: requestUrl,
        code: code,
        hasApiKey: Boolean(apiKey),
      });

      GM_xmlhttpRequest({
        method: 'GET',
        url: requestUrl,
        headers: {
          'X-Javstash-Api-Key': apiKey,
        },
        timeout: 15000,
        onload(response) {
          try {
            console.log('[JavStash] response received', {
              status: response.status,
              text: response.responseText,
            });
            const payload = JSON.parse(response.responseText || '{}');
            if (response.status >= 400 || payload.ok === false) {
              reject(new Error(payload.message || '查询失败'));
              return;
            }
            resolve(payload);
          } catch (error) {
            reject(error instanceof Error ? error : new Error('解析响应失败'));
          }
        },
        ontimeout() {
          console.error('[JavStash] request timeout', {
            url: requestUrl,
          });
          reject(new Error('请求超时，请稍后重试'));
        },
        onerror(response) {
          console.error('[JavStash] request error', response);
          reject(new Error('网络请求失败'));
        },
      });
    });
  }

  function injectButton(code) {
    if (!code || document.querySelector('.' + BUTTON_CLASS)) {
      renderDebugBadge(code ? 'JavStash: 按钮已存在' : 'JavStash: 未识别番号', '#d97706');
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.textContent = '查看简介';
    button.style.marginLeft = '8px';
    button.style.padding = '4px 10px';
    button.style.border = '1px solid rgba(0, 0, 0, 0.18)';
    button.style.borderRadius = '999px';
    button.style.background = '#fff';
    button.style.color = '#111';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';

    button.addEventListener('click', () => {
      const apiKey = getApiKey();
      if (!apiKey) {
        renderPanel({ state: 'missing-key', code: code });
        return;
      }

      renderPanel({ state: 'loading', code: code });
      requestLookup(code, apiKey)
        .then((payload) => {
          renderPanel({
            state: 'success',
            code: payload.code || code,
            title: payload.title || '',
            description: payload.description || '',
          });
        })
        .catch((error) => {
          renderPanel({
            state: 'error',
            code: code,
            message: error instanceof Error ? error.message : '查询失败',
          });
        });
    });

    const target = findInjectionTarget(code);
    if (target) {
      renderDebugBadge('JavStash: 已命中识别码位置', '#059669');
      if (target.parentNode) {
        target.parentNode.insertBefore(button, target.nextSibling);
      } else {
        target.appendChild(button);
      }
      return;
    }

    renderDebugBadge('JavStash: 使用右上角兜底按钮', '#2563eb');
    button.style.position = 'fixed';
    button.style.top = '24px';
    button.style.right = '24px';
    button.style.zIndex = '2147483646';
    document.body.appendChild(button);
  }

  function init() {
    renderDebugBadge('JavStash: 脚本已加载', '#7c3aed');
    registerMenu();
    const code = detectCode();
    if (!code) {
      renderDebugBadge('JavStash: 未从页面识别到番号', '#dc2626');
      return;
    }
    renderDebugBadge('JavStash: 识别到 ' + code, '#0f766e');
    injectButton(code);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
