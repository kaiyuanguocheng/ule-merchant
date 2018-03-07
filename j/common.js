

/**
 * 批销商家后台公共方法
 */
//对象原型扩展
String.prototype.substitute = function (data) {
    if (data && typeof (data) == 'object') {
        return this.replace(/\{([^{}]+)\}/g, function (match, key) {
            var value = data[key];
            return (value !== undefined) ? '' + value : '';
        });
    } else {
        return this.toString();
    }
};

var env = 'beta.ule.com';

var Merchant = {
    apis: {
        //单项选择分类
        classifyApi: '//merchant.'+env+'/fxMerchantItem/itemModify/getMerchantCategory.do',
        //商品分类联动选择
        linkageApi:'//merchant.'+env+'/fxMerchantItem/itemModify/getMerchantCategoryCross.do?jsonCallBack=?'
    },
    tpls: {
        //选择商品分类模板
        classifyLiTpl:'<li class="clearfix" data-level={level} data-merchantId={id}>{name} <span class="fr">&gt;&gt;</span></li>'
    },
    //模拟下拉框
    singleBox: function () {
        var self = this;
        var singleInput = $('.single-box .field-input');
        singleInput.click(function (event) {
            event.stopPropagation();
            event.preventDefault();
            $('.single-option').hide();
            $('.single-box').removeClass('focus');

            var $this = $(this);
            var singleOptionEl = $this.siblings('.single-option');
            var singleBoxEl = $this.closest('.single-box');

            singleOptionEl.show();

            singleBoxEl.addClass('focus');

            singleOptionEl.children('li').click(function () { 
                $this.val(self.unescapeStr($(this).html()));
                singleOptionEl.hide();
                singleBoxEl.removeClass('focus');
            })

            return false;
        })
        //关键词删选
        var optionsTextArr = [];
        singleInput.keyup(function (event) { 
            event.stopPropagation();
            event.preventDefault();
            var keyWords = $(this).val();
            var options = $(this).siblings('.single-option').children('li');
            options.each(function (index, el) {
                if(!optionsTextArr[index])optionsTextArr[index] = $(el).html();
                if (~$(el).html().indexOf(keyWords)) {
                    $(el).html(optionsTextArr[index]);
                    $(el).show();
                    if (keyWords) {
                        $(el).html($(el).html().replace(keyWords, '<i class="red">' + keyWords + '</i>'));
                    }
                } else {
                    $(el).html(optionsTextArr[index]).hide();
                }
            })
        })

        $(document).click(function (event) { 
            event.stopPropagation();
            event.preventDefault();
            $('.single-box').removeClass('focus').children('.single-option').hide();
        })
    },
    //选择商品分类
    selClassify: function () {
        var self = this;
        //已选分类
        var seledClassify = [];
        //初始化一级分类
        self.formatData();
        //事件触发二三级分类
        $('.level-option').on('click','li', function () {
            $(this).addClass('current').siblings('li').removeClass('current');

            var currentClassify = $(this).attr('data-merchantId');
            var level = parseInt($(this).attr('data-level'));
            var classifyName = $(this).text();
            var levelEl = $('.linkage-field .level');

            switch (level) { 
                case 1:
                    seledClassify = [classifyName];
                    levelEl.eq(2).find('ul').html('');
                    break;
                case 2:
                    seledClassify = [seledClassify[0],classifyName];
                    break;
                case 3:
                    seledClassify[2] = classifyName.substring(0,classifyName.length-2);
                    break; 
            }
            $(this).closest('.linkage-field').siblings('.field-input').val(seledClassify.join(''));

            if (level == 3) return false;
            var levelHtml = '';
            self.classifyData[currentClassify].forEach(function (data) { 
                levelHtml += self.tpls.classifyLiTpl.substitute(data);
            })
            levelEl.eq(level).find('ul').html(levelHtml);
        });

        $('.linkage-box .field-input').click(function (event) {
            event.stopPropagation();
            event.preventDefault();
            $('.linkage-box').addClass('focus');
            $(this).siblings('.linkage-field').show();
        })
        $('.linkage-box .linkage-field').click(function (event) {
            event.stopPropagation();
            event.preventDefault();
        })
        $(document).click(function (event) {
            event.stopPropagation();
            event.preventDefault();
            $('.linkage-box').removeClass('focus');
            $('.linkage-box .linkage-field').hide();
        })


    },
    //分类渲染
    formatData: function () {
        var self = this;
        self.classifyData = {};

        $.getJSON(self.apis.linkageApi, {
            flag: '1',
            merchantId:'101077',
            v:new Date().getTime()
        }, function (res) { 
            var allClassify = JSON.parse(res);
            if (!allClassify.length) return false;
            allClassify.forEach(function (item) {
                if (typeof self.classifyData[item.pgid] != 'undefined') {
                    self.classifyData[item.pgid][self.classifyData[item.pgid].length] = item;
                } else { 
                    self.classifyData[item.pgid] = [];
                }
                
            });
            var levelHtml = '';
            self.classifyData[0].forEach(function (data) { 
                levelHtml += self.tpls.classifyLiTpl.substitute(data);
            })
            $('.first-level ul').html(levelHtml);
            
        })
    },
    //格式化标准分类下拉选择框
    unescapeStr:function(a) {
        a = "" + a;
        return a.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    },
    //模拟单选框
    analogRadioSel: function () {
        var self = this;
        $('.analog-radio').click(function () {
            $(this).addClass('current').siblings('.analog-radio').removeClass('current');
        })

    },
    //验证表单
    checkForm: function () { 
        var self = this;
        $('.field-value').each(function (index, el) { 
            var fieldEl = $(this).find('.field-input');
            var fieldStr = fieldEl.val();
            var fieldErroText = fieldEl.attr('data-text');
            var pattern = new RegExp($(el).find('.field-input').attr('data-regexp'));

            if (!pattern.test(fieldStr)) { 
                fieldEl[0].value = fieldErroText;
                $(this).addClass('error').append('<em class="error-icon"></em>');
            }
        })

        $('.field-input').focus(function () { 
            if ($(this).closest('.field-value').hasClass('error')) { 
                $(this).val('').closest('.field-value').removeClass('error');
            }
        })
    },
    //商家后台侧边导航高度自适应
    siderBarAutoHeight: function () {
        $('#sidebar').height($(window).height() - 85);
        $('#content').css('min-height', $(window).height() - 85 + 'px');
        $(window).resize(function () { 
            $('#sidebar').height($(window).height() - 85);
            $('#content').css('min-height', $(window).height() - 85 + 'px');
        })
    },
    //右边锚点导航雪碧图
    rightAnchorNav: function () {
        var self = this;
        var anchorNavEl = $('#hgc_right-anchor li');
        var moduleEl = $('.module');

        var moduleOffsetTop = [];
        for (var i = 0, ilen = anchorNavEl.length; i < ilen; i++) { 
            anchorNavEl.eq(i).css('background-position', '0 -' + i * 55 + 'px');
            //存储各个模块的offsettop值
            if(i != ilen-1)moduleOffsetTop[i] = moduleEl.eq(i).offset().top;
        }

        anchorNavEl.click(function () { 
            var _index = $(this).index();
            var animateScroll = 0;
            if (_index != anchorNavEl.length - 1) { 
                animateScroll = moduleOffsetTop[_index] - 80;
            }
            $('body,html').stop().animate({ 'scrollTop':  animateScroll+ 'px' }, 500);
        })
        $(window).scroll(function () {
            for (var m = 0, mlen = moduleOffsetTop.length; m < mlen; m++) { 
                if ($(this).scrollTop() >= moduleOffsetTop[m]-80) { 
                    anchorNavEl.eq(m).addClass('current').siblings().removeClass('current');
                }
            }
            
        })

    },
    init: function(){ 
        this.singleBox();

        this.selClassify();

        this.analogRadioSel();

        this.siderBarAutoHeight();
    }
}


$(function () { 
    Merchant.init();
})

