/*
 * 更改原jQuery套件成vanilla js
 * 原檔案
 * https://frontend.beanfun.com/plugins/gbox/gbox.js
 */
/*
 ! 使用方式
 * 開啟 gbox
 * gbox.open(content[, option][, isSub]);
 *
 * content (String) 內容
 * option  (Object) 功能
 * isSub   (Boolean) 多開子項目

 * 執行方式
 * gbox.open(content);
 * gbox.open(content, option);
 * gbox.open(content, isSub);
 * gbox.open(content, option, isSub);

 * 關閉 gbox
 * gbox.close([gboxObject][, callback]);
 *
 * gboxObject (gbox Object) gbox物件關閉
 * callback   (String / Function) 關閉後執行

 * 執行方式
 * gbox.close();                     // 全部gbox關閉
 * gbox.close(gboxObject);           // 特定gbox關閉
 * gbox.close(callback);             // 全部gbox關閉，執行callback
 * gbox.close(gboxObject, callback); // 特定gbox關閉，執行callback
 ! content 內容 (必填)
 * (String) 顯示內容，可輸入html
 ! option 參數 (選填)
 * titleBar:     null,     // (String)  顯示標題列及內容，可輸入html
 * addClass:     null,     // (String)  加入class
 * fixedPos:     true,     // (Boolean) 是否鎖定畫面捲動
 * clickBgClose: false,    // (Boolean) 是否點擊背景關閉gbox
 * hasCloseBtn:  false,    // (Boolean) 是否顯示右上方關閉按鈕
 * closeBtn:     '\u00D7', // (String)  右上方關閉按鈕內容，可輸入html
 * hasActionBtn: true,     // (Boolean) 是否顯示下方按鈕列
 * actionBtns:             // (ArrayObject)
 *                         // 按鈕列預設一顆「確定」按鈕，功能為關閉gbox
 *               [{
 *                   text: '確定',                 // (String) 按鈕文字，可輸入html
 *                   id: '',                       // (String) 按鈕id
 *                   class:'',                     // (String) 按鈕class
 *                   target: false,                // (Boolean) 是否另開頁面，必須與click輸入網址同時使用
 *                   targetClose: true,            // (Boolean) 是否另開後關閉gbox
 *                   click: function() {          // (String | Function) 按下按鈕後功能
 *                       gbox.close(afterClose); //  輸入網址字串轉導 / 輸入function關閉後執行
 *                   }
 *               }]
 * afterOpen:    null      // (Function) gbox開啟時執行
 * afterClose:   null,     // (String | Function) gbox關閉後執行
 *                         // 輸入網址串轉導 / 輸入function關閉後執行
 ! isSub (選填)
 * (Boolean) 是否為子彈窗
 */
;(function(global) {
    /* 引入CSS */
    const stylePath = "https://tw.hicdn.beanfun.com/beanfun/GamaWWW/allProducts/style/gbox/";
    const newCssObj = document.createElement('link');
    newCssObj.type = 'text/css';
    newCssObj.rel = "stylesheet";
    newCssObj.href = stylePath + 'gbox.css';
    // newCssObj.href = './gbox.css';
    document.head.appendChild(newCssObj);

    /* 註冊事件 */
    function deepExtend(out) {
        out = out || {};
        for(let i = 1; i < arguments.length; i++) {
            let obj = arguments[i];
            if (!obj) continue;
            for(let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    let rawType = Object.prototype.toString.call(obj[key]);
                    if (rawType === '[object Object]') {
                        out[key] = deepExtend(out[key], obj[key]);
                    } else if (rawType === '[object Array]') {
                        out[key] = deepExtend(new Array(obj[key].length), obj[key]);
                    }else{
                        out[key] = obj[key];
                    }
                }
            }
        }
        return out;
    };
    function extend(out) {
        out = out || {};
        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i]) continue;
            for(let key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
            }
        }
        return out;
    };
    // 註冊 replaceAll (相容)
    String.prototype.replaceAll = function(FindText, RepText) {
        let regExp = new RegExp(FindText, "g");
        return this.replace(regExp, RepText);
    }
    // html字串處理
    function sanitizeHtml(htmlText) {
        let str = (htmlText) ? htmlText : '';
        // 1. 移除不安全的標籤
        const dangerousTags = /<\/?(script|style|link|form)\b[^>]*>/gi;
        str = str.replace(dangerousTags, '');
        // 2. 移除內聯事件處理器 (如 onclick="...")
        const inlineEventHandlers = /\son\w+="[^"]*"/gi;
        str = str.replace(inlineEventHandlers, '');
        // 3. 防止危險的 URL 協議（如 href="javascript:..."）
        const dangerousProtocols = /href\s*=\s*["']?\s*javascript:[^"']*/gi;
        str = str.replace(dangerousProtocols, 'href="javascript:;"');
        // 4. 防止 src="javascript:..."
        const dangerousSrc = /src\s*=\s*["']?\s*javascript:[^"']*/gi;
        str = str.replace(dangerousSrc, 'src="javascript:void(0);"');

        return str;
    };
    // 連結字串驗證
    function isValidHref(hrefText) {
        let str = (hrefText) ? hrefText : '';
        const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-.,@?^=%&:\/~+#]*)?$/i;
        const deepLinkRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+$/;
        return urlRegex.test(str) || deepLinkRegex.test(str);
    }
    // 是否為真物件
    function isPlainObject(value) {
        if (value === null || typeof value !== 'object') {
            return false;
        }
        return Object.getPrototypeOf(value) === Object.prototype;
    }
    /* plugin */
    let openControl = false;
    const gboxPlugin = function(content, options, isSub) {
        openControl = true;
        /* 參數 */

        // 預設參數
        let defaults = {
            titleBar: null,
            addClass: null,
            fixedPos: true,
            hasCloseBtn: false,
            closeBtn: '\u00D7', //可插入HTML
            clickBgClose: false,
            hasActionBtn: true,
            actionBtns: [{
                text: '確定',
                id: '',
                class: '',
                target: false,
                targetClose: true,
                click: function() {
                    gbox.close(settings.afterClose); //網址 or Function
                }
            }],
            afterClose: function(){}, //網址 or Function
            afterOpen: function(){} //function
        };

        // 合併參數
        let settings = deepExtend({}, defaults, options);

        /* 建立容器 */

        // 外容器
        const pubBox = document.createElement('div');
        pubBox.classList.add('gbox');
        const pubModule = document.createElement('div');
        pubModule.classList.add('gbox-module');
        const pubWrap = document.createElement('div');
        pubWrap.classList.add('gbox-wrap');

        // 內容容器
        const pubContent = document.createElement('div');
        pubContent.classList.add('gbox-content');

        /* content */

        // 內容置入
        let outputContent = sanitizeHtml(content);
        pubContent.innerHTML = outputContent;

        /* 合併容器 */
        pubBox.append(pubModule);
        pubBox.append(pubWrap);
        pubWrap.append(pubContent);

        /* 事件處理 */

        // afterOpen 開啟時執行
        let doAfterOpen = function(){};
        if (settings.afterOpen && typeof settings.afterOpen === 'function') {
            doAfterOpen = settings.afterOpen;
            doAfterOpen();
        } else if (settings.afterOpen && typeof settings.afterOpen !== 'function') {
            console.error('Error: The property "afterOpen" is not of type "function".');
        }

        // afterClose 關閉後執行
        let doAfterClose = function(){};

        // afterClose (string (url))
        if (settings.afterClose && typeof settings.afterClose === 'string' && isValidHref(settings.afterClose)) {
            doAfterClose = function() {
                let link = document.createElement('a');
                link.href = settings.afterClose;
                link.target = '_self';
                link.click();
            };

        } else if (settings.afterClose && typeof settings.afterClose === 'string' && !isValidHref(settings.afterClose)) {
            console.error('Error: The property "afterClose"  is not in the correct url format.');
        }

        // afterClose (function)
        if (settings.afterClose && typeof settings.afterClose === 'function') {
            doAfterClose = settings.afterClose;
        }

        // afterClose (error)
        if (settings.afterClose && typeof settings.afterClose !== 'function' && typeof settings.afterClose !== 'string') {
            console.error('Error: The property "afterClose"  is not of type "function" or "string".');
        }

        /* 參數處理 (option) */

        // addClass 新增外層class
        if (settings.addClass && typeof settings.addClass === 'string') {
            pubBox.classList.add(settings.addClass);
        } else if (settings.addClass && typeof settings.addClass !== 'string') {
            console.error('Error: The property "addClass" is not of type "string".');
        }

        // fixedPos 鎖定畫面
        if (settings.fixedPos && typeof settings.fixedPos === 'boolean') {
            document.body.classList.add('ov-hidden');
        } else if (settings.fixedPos && typeof settings.fixedPos !== 'boolean') {
            console.error('Error: The property "fixedPos" is not of type "boolean".');
        }

        // clickBgClose 點擊背景關閉
        if (settings.clickBgClose && typeof settings.clickBgClose === 'boolean') {
            document.addEventListener('click', function(e) {
                let container = pubWrap;
                // 是否範圍內
                if (container && !container.contains(e.target) && container !== e.target) {
                    // 關閉
                    gbox.close(doAfterClose);
                }
            });
        } else if (settings.clickBgClose && typeof settings.clickBgClose !== 'boolean') {
            console.error('Error: The property "clickBgClose" is not of type "boolean".');
        }

        // titleBar 標題列
        if (settings.titleBar && typeof settings.titleBar === 'string') {
            let pubTitleBar = document.createElement('div');
            pubTitleBar.classList.add('gbox-title');
            pubWrap.insertBefore(pubTitleBar, pubWrap.firstChild);
            pubTitleBar.innerHTML = sanitizeHtml(settings.titleBar);
        } else if (settings.titleBar && typeof settings.titleBar !== 'string') {
            console.error('Error: The property "titleBar" is not of type "string".');
        }

        // 右上方關閉按鈕
        if (settings.hasCloseBtn && typeof settings.hasCloseBtn === 'boolean') {
            let pubCloseBtn = document.createElement('button');
            pubCloseBtn.classList.add('gbox-close');

            // 關閉按鈕內容
            if (settings.closeBtn && typeof settings.closeBtn === 'string') {
                pubCloseBtn.innerHTML = sanitizeHtml(settings.closeBtn);
            } else if (settings.closeBtn && typeof settings.closeBtn !== 'string') {
                console.error('Error: The property "closeBtn" is not of type "string".');
            }

            // 置入
            pubWrap.append(pubCloseBtn);
            pubCloseBtn.addEventListener('click', function () {
                gbox.close(doAfterClose);
            });

        } else if (settings.hasCloseBtn && typeof settings.hasCloseBtn !== 'boolean') {
            console.error('Error: The property "hasCloseBtn" is not of type "boolean".');
        }

        // hasActionBtn 下方按鈕列
        if (settings.hasActionBtn && typeof settings.hasActionBtn === 'boolean') {
            const pubAction = document.createElement('div');
            pubAction.classList.add('gbox-action');

            // 按鈕處理
            if (settings.actionBtns && Array.isArray(settings.actionBtns) && settings.actionBtns.length >= 1){
                settings.actionBtns.forEach(function (item, index, arr) {

                    let pubActionBtn = document.createElement('a');
                    pubActionBtn.classList.add('gbox-btn');

                    /* 各項參數 */

                    // id
                    if (item.id && typeof item.id === 'string') {
                        pubActionBtn.id = item.id;
                    } else if (item.id && typeof item.id === 'string') {
                        console.error('Error: The property "actionBtns[' + index + '].id" is not of type "string".');
                    }

                    // class
                    if (item.class && typeof item.class === 'string') {
                        pubActionBtn.classList.add(item.class);
                    } else if (item.class && typeof item.class === 'string') {
                        console.error('Error: The property "actionBtns[' + index + '].class" is not of type "string".');
                    }

                    // click (string url)
                    if (item.click && typeof item.click === 'string' && isValidHref(item.click)) {
                        pubActionBtn.href = item.click;
                        // target (boolean) 是否另開
                        if (item.target && typeof item.target === 'boolean') {
                            pubActionBtn.target = '_blank';
                            pubActionBtn.rel = 'noopener noreferrer';
                            // targetClose (boolean) 是否另開後關閉
                            if (item.targetClose && typeof item.targetClose === 'boolean') {
                                pubActionBtn.addEventListener('click', function (e) {
                                    gbox.close(doAfterClose);
                                });
                            } else if (item.targetClose && typeof item.targetClose !== 'boolean') {
                                console.error('Error: The property "actionBtns[' + index + '].targetClose" is not of type "boolean".');
                            }
                        } else if (item.target && typeof item.target !== 'boolean') {
                            console.error('Error: The property "actionBtns[' + index + '].target" is not of type "boolean".');
                        }
                    } else if (item.click && typeof item.click === 'string' && !isValidHref(item.click)){
                        console.error('Error: The property "actionBtns[' + index + '].click"  is not in the correct url format.');
                    }

                    // click (function)
                    if (item.click && typeof item.click === 'function') {
                        pubActionBtn.href = 'javascript:void(0);';
                        pubActionBtn.addEventListener('click', function (e) {
                            item.click();
                        });
                    }

                    // click (error)
                    if (item.click && typeof item.click !== 'function' && typeof item.click !== 'string') {
                        console.error('Error: The property "actionBtns[' + index + '].click"  is not of type "function" or "string".');
                    }

                    // text 按鈕內容
                    if (item.text && typeof item.text === 'string') {
                        pubActionBtn.innerHTML = sanitizeHtml(item.text);
                    } else if (item.text && typeof item.text === 'string') {
                        console.error('Error: The property "actionBtns[' + index + '].text" is not of type "string".');
                    }

                    // 置入
                    pubAction.append(pubActionBtn);

                });
            } else if (settings.actionBtns && !Array.isArray(settings.actionBtns)) {
                console.error('Error: The property "actionBtns" is not of type "array".');
            }

            // 置入
            pubWrap.append(pubAction);

        } else if (settings.hasActionBtn && typeof settings.hasActionBtn !== 'boolean') {
            console.error('Error: The property "hasActionBtn" is not of type "boolean".');
        }



        /* 一版到底(特定版型配置) */
        let metaTags = document.querySelectorAll('meta');
        for (let m = 0; m < metaTags.length; m++) {
            let metaTag = metaTags[m];
            if (metaTag.content.match(/750/)) {
                pubWrap.classList.add('vp750');
            }
        }

        /* 置入body */
        document.body.appendChild(pubBox);

        /* 回傳以控制 */
        this.pubBox = pubBox;
        return this;
    };
    gboxPlugin.prototype = {
        version: '2.1',
        close: function(){
            this.pubBox.remove();
            document.body.classList.remove('ov-hidden');
        }
    }
    /* methods */
    // openControl
    const gbox = {
        close: function() {
            // [gboxObject][, callback]
            let arg = arguments;
            /* 錯誤排除 */
            function isPlugin(argObj){
                return typeof argObj === 'object' && argObj instanceof gboxPlugin;
            };

            // 一項內容型別判斷
            if (arguments.length === 1 && !isPlugin(arguments[0]) && typeof arguments[0] !== 'string' && typeof arguments[0] !== 'function') {
                console.error('Error: The property is not of type "gboxPlugin", "string" or "function".');
                return;
            } else if (arguments.length === 1 && typeof arguments[0] === 'string' && !isValidHref(arguments[0])){
                console.error('Error: The property is not in the correct url format.');
            }

            // 二項內容型別判斷
            if (arguments.length === 2 && !isPlugin(arguments[0])) {
                console.error('Error: The property[0] is not of type "gboxPlugin".');
                return;
            } else if (arguments.length === 2 && typeof arguments[1] !== 'string' && typeof arguments[1] !== 'function') {
                console.error('Error: The property[1] is not of type "object" or "boolean".');
                return;
            } else if (arguments.length === 2 && typeof arguments[1] === 'string' && !isValidHref(arguments[1])) {
                console.error('Error: The property[1] is not in the correct url format.');
                return;
            }

            /* 執行 */
            // 無參數
            if (arguments.length === 0) {
                openControl = false;
                let pubBox = document.querySelectorAll('.gbox');
                if (pubBox) {
                    pubBox.forEach(ele => {
                        ele.remove();
                    });
                }
            }
            // 一項 (plugin)
            if (arguments.length === 1 && isPlugin(arguments[0])){
                arguments[0].close();
            }
            // 一項 (url)
            if (arguments.length === 1 && typeof arguments[0] === 'string' && isValidHref(arguments[0])) {
                let link = document.createElement('a');
                link.href = arguments[0];
                link.target = '_self';
                link.click();
            }
            // 一項 (callback)
            if (arguments.length === 1 && typeof arguments[0] === 'function') {
                arguments[0]();
            }

            // 二項
            if (arguments.length === 2 && isPlugin(arguments[0]) &&
                ( (typeof arguments[1] === 'string' && isValidHref(arguments[1])) || typeof arguments[1] === 'function')
            ) {
                // 二項 (url)
                if (typeof arguments[1] === 'string' && isValidHref(arguments[1])){
                    let link = document.createElement('a');
                    link.href = arguments[1];
                    link.target = '_self';
                    link.click();
                }
                // 二項 (callback)
                if (typeof arguments[1] === 'function') {
                    arguments[1]();
                }
                arguments[0].close();
            }
        },
        open: function() {
            // content[, options][, isSub]
            /* 預設參數 */
            let content = '';
            let options = {};
            let isSub = false;

            /* 錯誤排除 */
            // 不可以沒有參數
            if (arguments.length === 0){
                console.error('Error: The property "content" is required.');
                return;
            }
            // 第一項必為 content(string)
            if (arguments.length >= 1 && typeof arguments[0] !== 'string') {
                console.error('Error: The property "content" is not of type "string".');
                return;
            }
            // 二項內容型別判斷
            if (arguments.length === 2 && !isPlainObject(arguments[1]) && typeof arguments[1] !== 'boolean') {
                console.error('Error: The property[1] is not of type "object" or "boolean".');
                return;
            }
            // 三項內容型別判斷
            if (arguments.length === 3 && !isPlainObject(arguments[1])) {
                console.error('Error: The property[1] is not of type "object".');
                return;
            } else if (arguments.length === 3 && typeof arguments[2] !== 'boolean') {
                console.error('Error: The property[2] is not of type "boolean".');
                return;
            }

            /* 內容 */
            // 一項內容 content
            if (arguments.length == 1 && typeof arguments[0] === 'string') {
                content = arguments[0];
            }
            // 二項內容 (options)
            if (arguments.length === 2 && isPlainObject(arguments[1])) {
                content = arguments[0];
                options = arguments[1];
            }
            // 二項內容 (isSub)
            if (arguments.length === 2 && typeof arguments[1] === 'boolean') {
                content = arguments[0];
                isSub = arguments[1];
            }
            // 三項內容
            if (arguments.length === 3 && isPlainObject(arguments[1]) && typeof arguments[2] === 'boolean'){
                content = arguments[0];
                options = arguments[1];
                isSub = arguments[2];
            }

            /* 執行 */
            let pubBox = document.querySelectorAll('.gbox');
            if (isSub === false){
                if (openControl === true){
                    if (pubBox){
                        pubBox.forEach(ele => {
                            ele.remove();
                        });
                    }
                    document.body.classList.remove('ov-hidden');
                }
            }

            return new gboxPlugin(content, options, isSub);
        },
    };
    // 註冊功能
    global.gbox = gbox;

    // vanilla輔助jQuery版gbox
    if (typeof jQuery === 'undefined') { // 無jQuery
        // 定義$
        const $ = function (selector) {
            const elements = document.querySelectorAll(selector);
            return {
                elements,
                // 使用selector開啟
                gbox: function () {
                    let arg = arguments;
                    this.elements.forEach(function (ele) {
                        ele.addEventListener('click', function (e) {
                            e.preventDefault();
                            gbox.open(...arg);
                        });
                    });
                    return this;
                },
            }
        };
        // 註冊$
        global.$ = $;
        // 註冊功能
        $.gbox = gbox;
    } else { // 有jQuery
        // selector功能
        $.fn.gbox = function () {
            let arg = arguments;
            $(this).on('click', function (e) {
                e.preventDefault();
                gbox.open(...arg);
            });
        };
        // 註冊功能
        $.gbox = gbox;
    }
})(window);