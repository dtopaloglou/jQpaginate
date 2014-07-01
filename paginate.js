/**
* jQpaginate v1.0
* A simple jQuery pagination plugin
* https://github.com/dtopaloglou/jQpaginate
*
* Copyright 2014, Dimitri Topaloglou
* Released under the MIT license.
*/
(function($){
    $.fn.paginate = function(method){

        var base = this;
        
        base.range = []; // interval of rows to be displayed

		var fns = { 
		
			init : function(options) {
				base.options = $.extend({},$.fn.paginate.defaultOptions, options);
				fns.setLimits()._hideRows()._drawLinks();
				base.options.onInit();
				return this;
			},
			
			getPerPage : function() {
				return base.options.perPage;
			},
			
			setLimits : function() {
				base.range = [fns.getStartPage(),  fns.getStartPage() + fns.getPerPage()];
				console.log(base.range);
				return this;
			},
			
			totalPages : function() {
				var rows = fns.getRows(),
					results = fns.getPerPage();
				return Math.ceil(rows/results);
			},
	
			getRows : function(){
				return  $(base).find(base.options.dataTable).length;
			},
			
			getPage : function() {
				if( base.options.currentPage <= 0) {
					return 1;	
				} else if (base.options.currentPage >= fns.totalPages()) {
					return 	fns.totalPages()
				} else {
					return base.options.currentPage;
				}
			},
			
			getStartPage : function() {
				return ( ( (fns.getPage() - 1) * fns.getPerPage() ) <= 0) ?  0 :  (fns.getPage() - 1) * fns.getPerPage();
			},
			
			adjacentLinks : function() {
				if(isNaN(base.options.displayedPages) || base.options.displayedPages < 0 )
					base.options.displayedPages = 2; 	
				return 	base.options.displayedPages;
			},

			next : function() {
				return fns.getPage() + 1;
			},
			
			previous : function() {
				return  fns.getPage() - 1;
			},
			
			getLeftLinks : function() {
				return ((fns.getPage() - fns.adjacentLinks()) >= 1) ? fns.adjacentLinks() :  (fns.getPage() - 1);
			},

			getRightLinks: function() {
				return  ((fns.getPage() + fns.adjacentLinks()) <= fns.totalPages() ) ?  fns.adjacentLinks() : (fns.totalPages() - fns.getPage());
			},
			
			_redrawLinks : function(page) {
				return fns._setPage(page)
					.setLimits()
					._hideRows()
					._drawLinks();
			},
			
			_hideRows : function() {
				var $region = $(base).find(base.options.dataTable);
				$region.each(function(row) {
				   if(row >= base.range[0] && row < base.range[1]) {
					   $(this).show(); 
				   } else {
					   $(this).hide();
				   }
				});
				return this;
			},			
						
			_setPage : function(page) {
				if(isNaN(page) || page < 0 ) {
					base.options.currentPage = 1; // don't accept anything but positive integers
				} else {
					base.options.currentPage = page;	
				}
				return this;
			},
						
			_levels : function() {
				var lev = {
					100 : 10,
					1000 : 75,
					5000 : 250,
					10000 : 500
				};
				return lev;
			},
			
			_skipper : function() {
				skipLevel = fns._levels();
				for(var  key in skipLevel) {
					if(fns.getPage() <= key) {
						return skipLevel[key];
					}
				}
			},
						
			_showlinks : function(links) {
				return (base.options.links == null) ? $(base).prepend(links) : $(base.options.links).html(links);
			},
		
			_drawLinks : function() {
				
				var page = fns.getPage(),
					totalPages = fns.totalPages(),
					nextPage = fns.next(),
					previousPage = fns.previous(),
					prefix = base.options.hrefTextPrefix;
				
				links  = (page > 1 && page <= totalPages  ? "<a class='paginate-previous'  paginateRef=\"" + previousPage +"\"  href='" + prefix + previousPage + "'>&laquo; Back</a>" : "<span class='disabled'>&laquo; Back</span>");			
				links += (page > 2 && page <= totalPages ? "<a class='paginate-first' paginateRef=\"1\" href='#page-1'>First</a>" : "");
				links += (page - 1) > fns._skipper() && base.options.skipper ? "<a class='paginate-skip' paginateRef=\"" + (page - fns._skipper()) + "\" href='" + prefix + (page - fns._skipper()) + "'> ... </a>" : "";
				// Create the links depending on range.
				for(var x = (page - fns.getLeftLinks()); x <= (page + fns.getRightLinks()); x++) { 
					if(x == page) {
						links += "<span class='current'>";
						links += (base.options.pageOnly == false) ? "Page <editable title='Click to edit' class='click-edit'>" + x + "</editable> of " + totalPages :  "<editable class='click-edit'>" + x + "</editable>";	
						links += "</span>";
					} else {
						links += "<a paginateRef=\"" + x + "\" href='" + prefix + x + "'>" + x + "</a> ";		
					}
				}

				links += (totalPages - page) > fns._skipper() && base.options.skipper ? "<a class='paginate-skip' paginateRef='" + (page + fns._skipper()) + "' href='" + prefix + (page + fns._skipper()) + "'>...</a>" : "";
				links += (page >= 1) && page < (totalPages - 1) ? "<a class='paginate-last' paginateRef=\"" + totalPages + "\" href='" + prefix + totalPages + "'>Last</a>" : "";
				links += (page >= 1)  && page < (totalPages - 0) ? "<a class='paginate-next' paginateRef=\"" + nextPage + "\" href='" + prefix + nextPage + "'>Next &raquo;</a>" : "<span  class='disabled'>Next  &raquo;</span>";
				
				if(base.options.position != null) {
					fns.displayOffset();
				}

				if(base.options.links != null) {
					fns._bindClick();
					return $(base.options.links).html(links).wrap('<div></div>').addClass(base.options.theme);
				} 
			},
			
			_bindClick : function () {
				$(base.options.links).off('click','a[paginateRef]').on('click','a[paginateRef]', function() {	
					var page = parseInt($(this).attr('paginateRef'));
					return fns._redrawLinks(page);
				});		
			},
			
			_fnCl : function() {
				var clickType;
				switch(base.options.clickEditType) {
					case 'click':
						clickType = 'click';
						break;
					case 'dblclick':
						clickType = 'dblclick';
						break;
					default:
						clickType = 'click';		
				}
				$(document).on(clickType, 'editable.click-edit',function (e) {
					e.stopPropagation();
					$(this).html('<input class="thVal" type="text" value='+ fns.getPage() +' />');
					$(".thVal").focus();
					$(document).on('keypress', 'editable.click-edit', function(e) {
						if(e.which==13) {
							fns._resetPageEdit();
						}
					});
					$(document).click(function() {
						fns._resetPageEdit();
					});					
					
				});	
			},
			
			_resetPageEdit : function() {
				var val  = $(".thVal").val();
				if ($(".thVal").length && $.trim(val) != fns.getPage() && !isNaN(val) ) {
					return fns._redrawLinks(parseInt(val));
				} else {
					$(".thVal").remove();
					$('editable.click-edit').text(fns.getPage());
					return this;
				}
			},
			
			displayOffset : function() {
				var out,
					page = fns.getPage() ,
					results = fns.getRows(),
					totalpages = fns.totalPages(),
					t1 = 0,
					t2 = 0;
	
				if(results>0) {
					switch(true) {
						case (page == 1 && results > fns.getPerPage()):
							t1 = 1;
							t2 = (0 + fns.getPerPage());
							break;
						case (page > 1 && page < totalpages):
							t1 = (((page * fns.getPerPage()) - fns.getPerPage()) + 1);
							t2 = (page * fns.getPerPage());
							break;
						case (page == totalpages):
							t1 = (((page * fns.getPerPage()) - fns.getPerPage()) + 1);
							t2 = results;
							break;	
						case (page == 1 && results < base.getPerPage()):
							t1 = 1;
							t2 = results;
							break;
						default:
							break;
					}
					out = '' + t1 + " - " + t2;
				} else {
					out = "0 - 0";
				}
				
				$(base.options.position).html("<span class='" + base.options.theme + " current-pos'>" + out + " of <tres class='total-results'>" +  results + "</tres></span>");
				return (base.options.quickEdit ? fns._fnCl() : this);
			}
		}
		
		return fns.init.apply(this, arguments);

    };
	
    $.fn.paginate.defaultOptions = {
        perPage: 28,
        displayedPages: 2, 
		pageOnly: false,   
		theme: 'simple',
		dataTable: 'tbody tr',
		hrefTextPrefix: '#page-',
		skipper: true,
		clickEditType: 'click',
		quickEdit: true,
		currentPage: 1,
		links: '#links',
		position: '#pos',
		onInit: function() { 
		
		}
    };
	
})(jQuery);