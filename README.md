# gbox
## 原檔案
```js
https://frontend.beanfun.com/plugins/gbox/gbox.js
```
******
## **<font color=#c33>調整參數新功能</font>**
### 開啟 gbox
```js
gbox.open(content[, option][, isSub])
```
* content (String) 內容 (必要值)
* option  (Object) 功能
* **<font color=#c33>isSub   (Boolean) 多開子項目，true則可以另開</font>**

#### 執行方式
```js
gbox.open(content);
gbox.open(content, option);
gbox.open(content, isSub);
gbox.open(content, option, isSub);
```

### 關閉 gbox
```js
gbox.close([gboxObject][, callback])
```
* **<font color=#c33>gboxObject (gbox Object) gbox物件關閉</font>**
* callback   (String / Function) 關閉後執行

#### 執行方式
```js
* gbox.close();                     // 全部gbox關閉
* gbox.close(gboxObject);           // 特定gbox關閉
* gbox.close(callback);             // 全部gbox關閉，執行callback
* gbox.close(gboxObject, callback); // 特定gbox關閉，執行callback
```
#### 範例
```js
let gboxA = gbox.open('單純輸入資訊A<br>單純輸入資訊A<br>單純輸入資訊A<br>單純輸入資訊A', {
    actionBtns:[
        {
            text: "開啟子跳窗",
            id:"btn-open-b",
            class: "btn-open-b",
            click: function(){
                let gboxB = gbox.open('單純輸入資訊B',{
                    actionBtns:[
                        {
                            text: "關閉子跳窗",
                            id:"btn-close-b",
                            class: "btn-close-b",
                            click: function(){
                                gbox.close(gboxB);
                            }
                        },
                        {
                            text: "關閉全部視窗",
                            id:"btn-close-all",
                            class: "btn-close-all",
                            click: function(){
                                gbox.close();
                            }
                        }
                    ]
                }, true);
            }
        },
        {
            text: "關閉主視窗",
            id:"btn-close-a",
            class: "btn-close-a",
            click: function(){
                gbox.close(gboxA);
            }
        }
    ]
});
```

******

## 使用方式 (vanilla javascript版)
### 直接開啟
```js
gbox.open('單純輸入資訊');
```
### 直接關閉
```js
gbox.close();
```


## 使用方式 (支援jQuery版功能)
### Element被點擊後開啟
```js
$('element').gbox('<div>輸入資訊</div>');
```
### 直接開啟
```js
$.gbox.open('單純輸入資訊');
```
### 直接關閉
```js
$.gbox.close();
```


## 各項參數

### 執行參數
#### 開啟 gbox
```js
gbox.open(content[, option][, isSub])
```
* content (String) 內容 (必要值)
* option  (Object) 功能
* isSub   (Boolean) 多開子項目

##### 執行方式
* gbox.open(content);
* gbox.open(content, option);
* gbox.open(content, isSub);
* gbox.open(content, option, isSub);

#### 關閉 gbox
```js
gbox.close([gboxObject][, callback])
```
* gboxObject (gbox Object) gbox物件關閉
* callback   (String | Function) 關閉後執行

### option參數
| 屬性 | 預設值 | 參數 | 說明 |
| - | - | - | - |
| titleBar  | null | String | 顯示標題列及內容，可輸入html |
| addClass  | null | String | 加入class |
| fixedPos  | true | Boolean | 是否鎖定畫面捲動 |
| clickBgClose  | false | Boolean | 是否點擊背景關閉gbox |
| hasCloseBtn  | false | Boolean | 是否顯示右上方關閉按鈕 |
| closeBtn  | '\u00D7' | String | 右上方關閉按鈕內容，可輸入html |
| hasActionBtn  | true | Boolean | 是否顯示下方按鈕列 |
| afterClose  | function(){} | String<br>Function | gbox關閉後執行<br>輸入網址串轉導 / 輸入function關閉後執行 |
| afterOpen  | function(){} | Function | gbox開啟時執行 |
| actionBtns  |  | Array<br>Object | 按鈕列預設一顆「確定」按鈕，功能為關閉gbox<br>陣列內可加入多組含有text、id、click屬性物件。<table>
|屬性|預設值|參數|說明|
|text|'確定'|String|按鈕文字，可輸入html|
|id|''|String|按鈕id|
|class|''|String|按鈕class|
|target|false|Boolean|是否另開頁面,必須與click輸入網址同時使用|
|targetClose|true|Boolean|是否另開後關閉gbox|
|click|function() {gbox.close(afterClose);}|String / Function|按下按鈕後功能<br>輸入網址字串轉導 / 輸入function關閉後執行|
</table>

### option: afterClose 關閉後觸發
> `gbox.close()`執行後觸發
```js
let msg = "gbox內容";
let config = {
    afterClose: function () {
        // 關閉後觸發
        console.log("關閉gbox");
    }
};
gbox.open(msg, config);
```

### option: afterOpen 開啟後觸發
> `gbox.open()`執行後觸發
```js
let msg = "gbox內容";
let config = {
    afterOpen: function () {
        console.log("開啟gbox");
    }
};
gbox.open(msg, config);
```
### actionBtns
> 按鈕預設class="gbox-btn"
>> text:(String)-按鈕文字。
>> id:(String)-按鈕ID
>> class:(String)-按鈕 Class
>> target: (Boolean)- 是否另開頁面(另開後會關閉gbox)必須與click輸入網址同時使用
>> click:(String、Function)-按下按鈕後功能。輸入網址為轉導亦可輸入function

#### actionBtns 用法1(String連結)
```js
let msg = "gbox內容";
let config = {
    hasActionBtn: true,
    actionBtns: [
        {
            text: "按鈕文字",
            id:"按鈕id",
            class: "按鈕class",
            target: true,
            click: "https://tw.beanfun.com/"
        }
    ]
};
gbox.open(msg, config);
```
#### actionBtns 用法2(Function)
```js
let msg = "gbox內容";
let config = {
    hasActionBtn: true,
    actionBtns: [
        {
            text: "按鈕文字",
            id:"按鈕id",
            class: "按鈕class",
            click: function(){
                console.log("按下按鈕後執行");
            }
        }
    ]
};
gbox.open(msg, config);
```

### example
```js
let msg = "gbox內容";
let config = {
    addClass: "default",
    titleBar:"我標題可用可不用",
    hasCloseBtn: true,
    hasActionBtn: true,
    afterClose:function(){
        console.log("按下關閉按鈕後觸發")
    },
    actionBtns: [
        {
            text: "確認",
            id:"success",
            class: "success",
            click: function(){
                console.log("確認後關閉")
                gbox.close()
            }
        },
        {
            text: "關閉",
            id:"close",
            class: "close",
            click: function(){
                // 關閉觸發afterClose
                gbox.close();
            }
        },
    ]
};
gbox.open(msg, config);
```