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

  // 统一集中声明脚本运行时所需的持久化键名、接口路径和 DOM 标识，
  // 方便后续切换部署地址或调整注入节点时只改这一处。
  const STORAGE_KEY = 'javstash_api_key';
  // const PROXY_ORIGIN = 'http://localhost:3456';
  const PROXY_ORIGIN = 'https://javstash.vercel.app';
  const LOOKUP_PATH = '/api/browser/lookup';
  const BUTTON_CLASS = 'javstash-lookup-button';
  const PANEL_ID = 'javstash-lookup-panel';

  // 将页面上解析出来的番号统一整理为大写格式，避免后续匹配时因为大小写或空格导致误判。
  function normalizeSceneCode(code) {
    return String(code || '').trim().toUpperCase();
  }

  // JavBus 详情页的番号直接体现在 URL 中，因此优先从路径提取，可减少整页文本扫描开销。
  function extractJavbusCode(url) {
    const match = String(url).match(/^https?:\/\/www\.javbus\.com\/([A-Za-z0-9]{2,10}-\d{2,6})\/?$/i);
    return match ? normalizeSceneCode(match[1]) : null;
  }

  // 仅在 JavDB 作品详情页执行特定 DOM 选择器逻辑，避免搜索页或列表页误触发。
  function isJavdbDetailUrl(url) {
    return /^https?:\/\/(?:www\.)?javdb\.com\/v\/[A-Za-z0-9]+(?:[/?#].*)?$/i.test(String(url));
  }

  // 作为兜底策略，从一段普通文本中提取类似 SSIS-123 的番号模式。
  function extractCodeFromText(text) {
    const match = String(text || '').match(/\b([A-Za-z0-9]{2,10}-\d{2,6})\b/);
    return match ? normalizeSceneCode(match[1]) : null;
  }

  // JavDB 页面结构较稳定，先找到“番号/番號”标签对应的值节点，后续按钮也优先挂到这里。
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

  // 通过油猴菜单让用户自行维护 ApiKey，避免把敏感信息直接硬编码到脚本里。
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
      // 先走结构化 DOM 提取，找不到时再回退到全文正则扫描，兼顾速度与兼容性。
      return extractJavdbCodeFromPage() || extractCodeFromText(document.body.innerText || '');
    }

    return extractJavbusCode(window.location.href) || extractCodeFromText(document.body.innerText || '');
  }

  // 优先把按钮插到番号旁边；如果页面结构变化导致命中失败，再退回右上角悬浮按钮。
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

    // 结果面板固定挂在页面右下角，避免依赖站点现有样式体系。
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
    panel.style.background = 'linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(251, 191, 36, 0) 72px), #111418';
    panel.style.color = '#f3f4f6';
    panel.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 20px 48px rgba(0, 0, 0, 0.45)';
    panel.style.padding = '14px 14px 12px';
    panel.style.fontSize = '14px';
    panel.style.lineHeight = '1.7';
    panel.style.display = 'none';
    panel.style.backdropFilter = 'blur(10px)';

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
    header.style.alignItems = 'flex-start';
    header.style.marginBottom = '12px';
    header.style.gap = '12px';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.06)';

    const title = document.createElement('strong');
    title.textContent = state.code ? '🔎 番号 ' + state.code + ' 中文内容查询' : '🔎 中文内容查询';
    title.style.fontWeight = '700';
    title.style.fontSize = '15px';
    title.style.lineHeight = '1.5';
    header.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.style.border = '0';
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#9ca3af';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '18px';
    closeButton.style.lineHeight = '1';
    closeButton.style.padding = '0';
    closeButton.style.flex = '0 0 auto';
    closeButton.onclick = function () {
      panel.style.display = 'none';
    };
    header.appendChild(closeButton);
    panel.appendChild(header);

    const body = document.createElement('div');
    panel.appendChild(body);

    // 按状态分别渲染面板，保证查询前、缺少 ApiKey、请求失败、成功命中时的文案都清晰可见。
    if (state.state === 'loading') {
      body.textContent = '正在查询中文内容...';
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

    // const codeLine = document.createElement('div');
    // codeLine.style.marginBottom = '10px';
    // codeLine.innerHTML = '<strong>番号：</strong>';
    // codeLine.appendChild(document.createTextNode(state.code || '-'));
    // body.appendChild(codeLine);

    const titleBlock = document.createElement('div');
    titleBlock.style.marginBottom = '14px';
    const titleText = document.createElement('div');
    titleText.style.fontSize = '16px';
    titleText.style.fontWeight = '600';
    titleText.style.color = '#ffffff';
    titleText.style.letterSpacing = '0.01em';
    titleText.style.lineHeight = '1.55';
    titleText.textContent = state.title || '暂无标题';
    titleBlock.appendChild(titleText);
    body.appendChild(titleBlock);

    const descBlock = document.createElement('div');
    descBlock.style.padding = '10px 12px';
    descBlock.style.background = 'rgba(255, 255, 255, 0.03)';
    descBlock.style.borderLeft = '2px solid rgba(251, 191, 36, 0.45)';
    descBlock.style.borderRadius = '8px';
    const descText = document.createElement('div');
    descText.style.color = '#d1d5db';
    descText.style.whiteSpace = 'pre-wrap';
    descText.textContent = state.description || '暂无简介';
    descBlock.appendChild(descText);
    body.appendChild(descBlock);

    const footer = document.createElement('div');
    footer.style.marginTop = '14px';
    footer.style.paddingTop = '10px';
    footer.style.borderTop = '1px solid rgba(255, 255, 255, 0.08)';
    footer.style.fontSize = '12px';
    footer.style.color = '#9ca3af';
    footer.textContent = '🌐 更多完整中文内容可前往 ';

    const footerLink = document.createElement('a');
    footerLink.href = 'https://javstash.vercel.app/';
    footerLink.target = '_blank';
    footerLink.rel = 'noreferrer noopener';
    footerLink.textContent = 'javstash.vercel.app';
    footerLink.style.color = '#fbbf24';
    footerLink.style.fontWeight = '600';
    footerLink.style.textDecoration = 'none';
    footer.appendChild(footerLink);

    const footerTail = document.createTextNode(' 查看');
    footer.appendChild(footerTail);
    body.appendChild(footer);
  }

  function requestLookup(code, apiKey) {
    return new Promise((resolve, reject) => {
      const requestUrl = buildLookupUrl(code);

      GM_xmlhttpRequest({
        method: 'GET',
        url: requestUrl,
        headers: {
          'X-Javstash-Api-Key': apiKey,
        },
        timeout: 15000,
        onload(response) {
          try {
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
          reject(new Error('请求超时，请稍后重试'));
        },
        onerror() {
          reject(new Error('网络请求失败'));
        },
      });
    });
  }

  function injectButton(code) {
    if (!code || document.querySelector('.' + BUTTON_CLASS)) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.textContent = '中文详情';
    button.style.marginLeft = '8px';
    button.style.padding = '5px 10px';
    button.style.border = '1px solid rgba(251, 191, 36, 0.32)';
    button.style.borderRadius = '999px';
    button.style.background = '#171b21';
    button.style.color = '#f3f4f6';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.18)';

    button.addEventListener('click', () => {
      const apiKey = getApiKey();
      if (!apiKey) {
        renderPanel({ state: 'missing-key', code: code });
        return;
      }

      // 每次点击都重新读取 ApiKey，这样用户在菜单里更新后无需刷新页面即可生效。
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
      if (target.parentNode) {
        target.parentNode.insertBefore(button, target.nextSibling);
      } else {
        target.appendChild(button);
      }
      return;
    }

    button.style.position = 'fixed';
    button.style.top = '24px';
    button.style.right = '24px';
    button.style.zIndex = '2147483646';
    document.body.appendChild(button);
  }

  function init() {
    registerMenu();
    const code = detectCode();
    if (!code) {
      return;
    }
    injectButton(code);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
