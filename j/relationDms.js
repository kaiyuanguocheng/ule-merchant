
/**
 * 关联DMS商品 byluffy
 * 
 */

var RelationDms = {
    init: function () { 
        
        this.paginationCtr();
    },
    paginationCtr: function () { 

        $(".M-box1").createPage({
            pageNum: 50,//总页码
            current: 1,//当前页
            backfun: function(e) {
                console.log(e);
            }
        });
    }
}

$(function () { 
    RelationDms.init();
})