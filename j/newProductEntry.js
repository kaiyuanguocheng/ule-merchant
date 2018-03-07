
/**
 * 新商品属性录入
 * by luffy
 * 
 */

var newProductEntry = {
    init: function () {
        this.textEditor();
        this.bindEvent();
    },
    textEditor: function () {
        var E = window.wangEditor;
        var editor = new E('#editor');
        editor.create()
    },
    bindEvent: function () { 

        $('.hgc_editor-success a').click(function (event) { 
            Merchant.checkForm();
        })
    }
}

$(function () { 
    newProductEntry.init();
        
    Merchant.rightAnchorNav();
})


