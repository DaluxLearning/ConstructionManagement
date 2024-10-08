if(settings && !settings.themeHideNav){
	var kbSearch = function(){
		var term = $(".kb-search-input").val();
		if(!$("html").hasClass("in-search-page") && settings.design.parameters.config.searchFiltersHome){
			return false;
		}
		if(settings.design.parameters.config.searchFiltersHome){
			var showAsGrid = settings.design.parameters.config.searchResultsInGrid;
			if(term != ''){
				$("html").addClass("has-search-results");
				if(showAsGrid){
					$(".kb-landing-cards-cont").addClass("resultsInGrid");
				}
				$(".kb-landing-cards .kb-card").each(function(i,o){
					var card = $(this);
					if(!showAsGrid){
						card.find("#showMore").hide();
					}
					card.find(".kb-card-items li").removeClass("hidden").removeClass("hiddenBySearch");
				});
			}else{
				$("html").removeClass("has-search-results");
				$(".kb-landing-cards .kb-card .kb-card-items li").removeClass("hiddenBySearch");
			}
			$(".kb-landing-cards-cont .kb-card").removeClass('expanded last-card');
			$(".kb-landing-cards-cont .kb-card #showMore span").text(DKI.strings.index.listButtonLabel + "...");
			$(".kb-landing-cards-cont .kb-card #showMore i").removeClass('fa-caret-up').addClass('fa-caret-down');
			$(".kb-landing-cards-cont > div").velocity("stop");
			$(".kb-landing-cards-cont > div").css({opacity: 0, display: "none"});
			var results = dataStorage.searchManager.search(term);

			$(".kb-landing .kb-card-items li").each(function(){
				if(term != ''){
					$(this).addClass("hiddenBySearch");
					for(var i=0; i < results.length; i++){
						if(typeof results[i].obj.pageid != 'undefined'){
							var subeo = dataStorage.getSubeoFromPage(results[i].obj.pageid);
							if(subeo.subeoid == $(this).data("id")){
								$(this).removeClass("hiddenBySearch");
							}
						}
					}
				}
			});
			var shownPageLength = $(".kb-landing .kb-card-items li:not(.hiddenBySearch)").length;
			$($(".kb-landing .kb-card-items li:not(.hiddenBySearch)")[shownPageLength - 1]).closest(".kb-card").addClass("last-card");
			$(".kb-landing-cards .kb-card").each(function(i,o){
				var items = $(this).find(".kb-card-items li:not(.hiddenBySearch):not(.hidden)");
				var moreButton = $(this).find("#showMore");
				var card = $(this);
				if(term == ''){
					$(this).parent().velocity("fadeIn", {duration: 500, delay: i * 150});
					card.find("#showMore").show();
					card.find(".kb-card-items li").each(function(i,o){
						if(i >= 5){
							$(this).addClass("hidden");
						}
					});
					$(".kb-landing-search .input-group-btn .btn span").addClass("fa-search").removeClass("fa-spinner fa-spin");
				}else if(items.length){
					$(this).parent().velocity("fadeIn", {duration: 500, delay: i * 150, complete: function(){
						if(card.hasClass("last-card")){
							$(".kb-landing-search .input-group-btn .btn span").addClass("fa-search").removeClass("fa-spinner fa-spin");
						}
					}});
					if(showAsGrid){
						card.find("#showMore").hide();
						card.find(".kb-card-items li:not(.hiddenBySearch)").each(function(i,o){
							if(i >= 5){
								$(this).addClass("hidden");
								card.find("#showMore").show();
							}
						});
					}
				}else{
					$(".kb-landing-search .input-group-btn .btn span").addClass("fa-search").removeClass("fa-spinner fa-spin");
				}
			});
			
		}else{
			DKI.search.Window.show(term);
			$("body").removeClass("kb-landing-show");
		}
	};
	
	var onSearchFormSubmit = function(){
		if(!settings.design.parameters.config.searchAsYouType || !settings.design.parameters.config.searchFiltersHome){
			$(".kb-landing-search .input-group-btn .btn span").removeClass("fa-search").addClass("fa-spinner fa-spin");
			kbSearch();
		}
	};

	!function() {
		var platform = dkiUA.getUAProperties().platform;
		var state = {
			design     : settings.design,
			glossaries : [],
			index      : {},
			config     : {}

		},
			dom = {},
			templates = {
				card : Handlebars.compile("{{>kbCard}}"),
				glossary : Handlebars.compile("<div class=\"kb-glossary\">" + 
					"<h4>{{term.term}}</h4>" + 
					"<div class=\"kb-glossary-definition\">{{{term.definition}}}</div>" + 
					"{{#if subeos}}" + 
						"<div class=\"kb-related-pages\">"  + 
							"<h5>Related Pages</h5>" + 
							"<ul>" + 
								"{{#each subeos}}" + 
									"<li class=\"kb-related-item page\" title=\"{{{this.page.title}}}\" data-id=\"{{this.subeoid}}\"><span class=\"fa fa-file-text-o\"></span><span>{{this.page.title}}</span></li>" + 
								"{{/each}}" + 
							"</ul>" + 
						"</div>" + 
					"{{/if}}" +
				"</div>"),
				index : Handlebars.compile("<ul class=\"nav nav-stacked kb-index-list\">" +
				 "{{#each indices}}" +
				 	"<li class=\"panel\">" + 
				 		"<a data-toggle=\"collapse\" href=\"#dki-index-{{this.baseTitle}}\" tabindex=\"1\">{{{this.title}}}</a>"+ 
				 		"<ul id=\"dki-index-{{this.baseTitle}}\" class=\"collapse\">" + 
				 			"{{#each this.pages}}" +
				 				"<li data-id=\"{{this.subeoid}}\"><span class=\"fa fa-file-text-o\"></span><span tabindex=\"1\">{{{this.title}}}</span></li>" +
				 			"{{/each}}" + 
				 		"</ul>" +
				 	"</li>" +
				 "{{/each}}" +
				"</ul>" ),
				landing : Handlebars.compile("<div class=\"kb-landing\">" +
					"<div class=\"kb-landing-heading-container\">" +
						"<div class=\"kb-landing-heading container\">" + 
							"<div class=\"row kb-courseTitle\">" + 
								"<div class=\"col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1\" tabindex=\"1\" title='{{title}}'><h1>{{{title}}}</h1></div>" + 
							"</div>" + 
							"<div class=\"row kb-courseDescription\">" + 
								"<div class=\"col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1\"><h5 tabindex=\"1\" title='{{description}}'>{{{description}}}</h5></div>" + 
							"</div>" + 
							"<div class=\"row\" style=\"padding-top:40px\">" +
								"<form action=\"javascript:onSearchFormSubmit();\">" +
									"<div class=\"kb-landing-search col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1 input-group\">" + 
										"<input type=\"text\" class=\"form-control kb-search-input input-lg\" tabindex=\"1\" placeholder=\"Search\">" + 
										"<span class=\"input-group-btn\">" + 
											"<button type=\"submit\" class=\"btn btn-default btn-lg\" tabindex=\"1\"	><span class=\"fa fa-search\"></span></button>" + 
										"</span>" +
									"</div>" +
								"</form>" + 
							"</div>" + 
						"</div>" + 
					"</div>" + 
					"<div class=\"kb-landing-cards\">" + 
						"<div class=\"kb-landing-cards-cont\">" +  
							"{{#each cards}}" + 
								"<div class=\"col-xs-10 col-xs-offset-1 {{this.classes}}\">" + 
									"{{>kbCard this}}" + 
								"</div>" + 
							"{{/each}}" +
						"</div>" + 
					"</div>" + 
				"</div>")
			};
		Handlebars.registerPartial("kbCard","<div class=\"kb-card {{#if active}}active{{/if}}\" data-id=\"{{object.eoid}}\">" + 
			"<h4 tabindex=\"1\" title='{{object.title}}'>{{{object.title}}}</h4>" + 
			"<ul class=\"kb-card-items\">" + 
				"{{#each items}}" + 
					"<li class=\"{{#if this.hidden}}hidden{{/if}}\" data-id=\"{{this.id}}\" tabindex=\"1\" title=\"{{{this.title}}}\"><span class=\"kb-card-item-icon {{this.icon}}\"></span><span class=\"kb-card-item-title\" title='{{this.title}}'>{{{this.title}}}</span></li>" + 
				"{{/each}}" +
			"</ul>" + 
			"{{#if showAllPages}}" +
				"<a id=\"showMore\" tabindex=\"1\" href=\"#\"><span>{{{strings.more}}}...</span><i class=\"fa fa-caret-down\" aria-hidden=\"true\"></i></a>" +
			"{{/if}}" +
		"</div>");
		Handlebars.registerPartial("link","<div class='kb-link'><a href='{{this.url}}' target='_link' tabindex=\"1\"><span class='fa {{this.icon}}'></span><span>{{this.label}}</span></a></div>");
		$("body").prepend($(Handlebars.compile(state.design.parameters.editor.templates.left_menu)({
			strings: DKI.strings
		})));
		$("body").prepend($(Handlebars.compile(
			"<div id=\"headerContainer\" role=\"application\"><div id=\"menu-menu-button\" tabindex=\"1\" class=\"icon icon-menu menu-buttom\"></div><div id=\"navbar_home\" class=\"home fa fa-home\" tabindex=\"1\" title=\"{{strings.index.menuButtonLabel}}\"></div><div id=\"navbar_logo\" tabindex=\"1\"></div><div class=\"rightContainer\"><div class=\"links\"></div>" +
			"<div id=\"navmenu_language_wrapper\"></div>" +
			"<div id=\"navbar_search\" class=\"search fa fa-search\" tabindex=\"1\" title=\"{{lookup strings.runtime \"theme Search\"}}\"></div></div></div>"
		)({
			strings: DKI.strings
		})));
		$(".bgRepeater").before("<div class=\"kb-info-header\" role=\"application\">" + 
			"<div class=\"kb-info-header-lo\"><div class=\"kb-info-header-lo-title\" tabindex=\"1\"></div><div class=\"kb-info-header-share\" tabindex=\"1\"><i class=\"fa fa-share-square-o\"></i>Share</div></div>" + 
			"<div class=\"kb-info-header-page\">" +
				"<div class=\"kb-info-header-page-info\">" + 
					"<div class=\"kb-info-header-page-title\" tabindex=\"1\"></div>" + 
					"<div class=\"kb-info-header-page-properties\">" + 
						"<span class=\"kb-info-header-page-createdOn\" tabindex=\"1\"></span>" + 
					"</div>" + 
				"</div>" + 
				"<div id=\"forwardButton\" class=\"kb-info-header-page-next\" tabindex=\"1\"></div>" + 
			"</div>" + 
		"</div>");
		dom = {
			header: {		
				container: $("#headerContainer"),
				progressIndication: $('<div id="progress"></div>'),
				progressBar: $('<div id="progressBar"></div>'),
				kbInfo : $(".kb-info-header"),
				share  : $(".kb-info-header-share"),
				menuButton : $("#headerContainer .menu-menu-button").on(settings.clickEvent, function(){
					if(!dom.menu.container.is(':visible')){
						$(theme).trigger(theme.events.menuOpened);
					}
					dom.menu.container.find(".tooltipstered").tooltipster("close");
					dom.menu.container.toggle("slide");
				}),
			},
			seeAlso : $("<div class=\"kb-see-also\"><h4 tabindex=\"1\">Related Articles</h4><div class=\"kb-see-also-content clearfix\"></div></div>").insertAfter("#contentFrame"),
			menu: {
				container: $(".menu-container"),
				topics   : $("#topics"),
				index    : $("#index .kb-card"),
				glossary : $("#glossary .kb-glossary-list"),
				search   : $("<input></input>", {
					"class": "menu-search",
					"placeholder": "Search Knowledge Base"
				}),
				menuButton : $(".menu-container .menu-menu-button").on(settings.clickEvent, function(){
					dom.menu.container.find(".tooltipstered").tooltipster("close");
					dom.menu.container.toggle("slide");
				}),
				buttons: {
					container: $("<div></div>", {
						"class": "button-container"
					}),
					exit: $("#exitButton").detach().addClass("icon icon-close"),
					glossary: $("#glossaryButton").addClass("icon icon-glossary icon-drilldown"),
					resources: $("#resourceButton").addClass("icon icon-resources icon-drilldown"),
					replay: $("#replayButton").addClass("icon icon-replay")
				}
			}
		};
		var links = [];
		if(settings.design.parameters.config.menuItems){
			$.each(settings.design.parameters.config.menuItems,function(i,o){
				if(Object.keys(o).length !== 0 && !o.disabled){
					links.push(o);
				}
			});
		}
		if(links.length > 0){
			var search = dom.header.container.find(".search");
			cont = dom.header.container.find(".links");
			if(links.length == 1){
				cont.append(Handlebars.compile("{{>link}}")(links[0]));
			}else{
				cont.addClass("drop").attr("tabindex", "1").append("<span>" + DKI.strings.resources.txtLinksHeader +"</span><span class='fa fa-chevron-down'></span>");
				$("body").append(Handlebars.compile("<div class='linksPopup' style='display:none' tabindex='1' aria-hidden='false' role='dialog'>" + 
					"{{#each this}}" + 
						"{{>link this}}" + 
					"{{/each}}" + 
				"</div>")(links));
			}
		}
		if(DKI.renderService.state.renderEnvironment.full){
			var jumpTo = DKI.func.debounce(function(id){
				contentApi.jumpToSubeo(id);
			},250,false);
			var pageClicked = function(el){
				var parent = $(el).closest(".kb-card"),
					fromIndex = $(el).closest("#index")[0] ? true : false;
				dom.menu.container.find(".kb-card, .kb-card li").removeClass("active");
				parent.addClass("active");
				$(el).addClass("active");
				jumpTo($(el).data("id"));
				fromIndex ? dom.header.kbInfo.addClass("fromIndex") : dom.header.kbInfo.removeClass("fromIndex");
			};
			//adding KB focus handling
			document.addEventListener('keydown', function(e) {
				if (e.keyCode === 9) {
					$('body').addClass('show-focus-outlines');
				}
			});
			dom.menu.index.on(settings.clickEvent,".panel",function(){
				var children = $(this).find("li");
				if(children.length == 1){
					pageClicked(children);
					return false;
				}
			});
			dom.menu.container.on(settings.clickEvent,"#topics li,#index .collapse li",function(){
				pageClicked(this);
				return false;
			});
			dom.menu.container.on(settings.clickEvent,"#glossary .glossaryPanel li",function(e){
				DKI.glossary.showPopup.call(this,e);
				return false;
			});
			dom.menu.container.on("click",".nav-pills > li",function(){
				dom.menu.container.find(".tooltipstered").tooltipster("close");
			});
			$("body").on(settings.clickEvent,".kb-glossary-popup .kb-related-item",function(){
				jumpTo($(this).data("id"));
			});
			dom.header.container.on(settings.clickEvent,".links.drop",function(){
				$(".linksPopup").toggle();
				if($(".linksPopup").is(':visible')){
					$(".linksPopup").focus();
				}
				return false;
			});
			$(document).on(settings.clickEvent,function(){
				$(".linksPopup").hide();
			});
			if(dom.header.share[0]){
				dom.header.share.on(settings.clickEvent,function(){
					var s = $(this).data("shareLink");
					var self = $(this);
					if(s){
						var clip = $("<textarea/>",{
							"html" : s,
							css : {
								"position"   : "absolute",
								"z-index"    : -9999,
								opacity      : 0,
								top          : $(this).offset().top,
								"font-size"  : "12pt"
							},
						}).appendTo($("body"));
						clip[0].select(),
						clip[0].setSelectionRange(0,s.length);
						try {  
						    var a = document.execCommand('copy');  
						} catch(err) {  
							var a = false;
						}
						clip.remove();
						var txt = a ? "Page Link has been copied to clipboard" : s;
						var msgBox = $("<div/>",{
							"class" : "clipboard fade",
							html : "<div class=\"clip-message\" tabindex=\"1\">" + txt + "</div><div class=\"btn btn-primary pull-right\" tabindex=\"1\">OK</div>"
						}).attr({
							tabindex:"1",
							role:"dialog"
						}).on("click",".btn",function(){
							$(this).parent().on("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd", function(){$(this).remove();}).removeClass("in");
							self.focus();
						});
						$("body").append(msgBox);
						setTimeout(function(){
							msgBox.addClass("in");
						},10);
					}
				});
			}
		}
		var renderSeeAlsoForTopics = function(page){
			var pages = [],
				reach = 3,
				current = reach,
				currentPage = page
			while(current > 0 && currentPage !== null){
				currentPage = dataStorage.getPrecedingPage(currentPage.page.pageid);
				if(currentPage && currentPage.objectid == page.objectid && currentPage.page.pageid != page.page_id){
					pages.push(currentPage);
					current --;
				}else{
					currentPage = null;
				}
			}
			current += reach;
			currentPage = page;
			while(current > 0 && currentPage !== null){
				currentPage = dataStorage.getProceedingPage(currentPage.page.pageid);
				if(currentPage && currentPage.objectid == page.objectid && currentPage.page.pageid != page.page_id){
					pages.push(currentPage);
					current --;
				}else{
					currentPage = null;
				}
			}
			return pages;
		}
		var renderSeeAlso = function(page){
			if(DKI.renderService.state.renderEnvironment.full){
				var mode = $(".nav-pills > li.active a",dom.menu.container).attr("href").replace("#",""),
					pages = [],
					reach = 3;
				if(mode == 'topics' && state.design.parameters.editor.less_modifications.indexOf("@menu_show_index:false") > - 1){
					pages = renderSeeAlsoForTopics(page);
				}else{
					var pagesWithMatches = [];
					var mappedPages = [];
					var selectedPageTagCount = page.page.keywords.length;

					$.each(page.page.keywords,function(){
						$.each(state.index[this],function(){
							if(this.page_id != page.page_id && !$.inArray(this, pagesWithMatches)){
								pagesWithMatches.push(this);
								mappedPages.push({
									page: this,
									tagCount: this.page.keywords.length,
									tagMatchCount: 1
								});
							}else if($.inArray(this, pagesWithMatches)){
								for(var i=0; i < mappedPages.length; i++){
									if(this.page.id == mappedPages[i].page.page.id){
										mappedPages[i].tagMatchCount += 1;
									}
								};
							}
						});
					});

					for(var i=0; i < mappedPages.length; i++){
						var currentMapItem = mappedPages[i];
						if(pages.length <= (reach * 2) && currentMapItem.tagMatchCount == selectedPageTagCount && currentMapItem.tagCount == selectedPageTagCount){
							pages.push(currentMapItem.page);
						}
					}
					for(var i=0; i < mappedPages.length; i++){
						var currentMapItem = mappedPages[i];
						if(pages.length <= (reach * 2) && currentMapItem.tagMatchCount == selectedPageTagCount && currentMapItem.tagCount > selectedPageTagCount){
							pages.push(currentMapItem.page);
						}
					}
					for(var i=0; i < mappedPages.length; i++){
						var currentMapItem = mappedPages[i];
						if(pages.length <= (reach * 2) && currentMapItem.tagMatchCount < selectedPageTagCount){
							pages.push(currentMapItem.page);
						}
					}
					if(!pages.length){
						pages = renderSeeAlsoForTopics(page);
					}
				}
				var cont = dom.seeAlso.find(".kb-see-also-content").html("");
				$.each(pages,function(){
					var page = this;
					cont.append($("<div/>",{
						"class" : "kb-see-also-item col-sm-6 col-xs-12",
						html    : "<span class=\"fa fa-file-text-o\"></span><span class=\"item-title\" tabindex=\"1\">" + this.page.title + "</span>",
						attr    : {
							title : this.page.title
						},
						click   : function(){
							jumpTo(page.subeoid);
						}
					}));
				});
				pages.length === 0 ? dom.seeAlso.hide() : dom.seeAlso.show();
			}
		};
		var renderLanding = function(){
			var courseTitle = contentApi.getProjectTitleForDisplay();
			var courseDescription = contentApi.getProjectDescriptionForDisplay();
			var cfg = {
				title : "",
				description : ""
			};
			cfg = {
				title       : courseTitle,
				description : courseDescription
			};
			var maxPages = 5,
				items = [];
			$.each(dataStorage.courseStructure.modules,function(){
					$.each(this.objects,function(){
						var cfg = {
							object : {
								eoid   : this.eoid,
								title  : this.eodesc,
								items  : []
							},
							items : [],
							active : true,
							showAllPages : false,
							classes : function(){
								var classes = "col-sm-offset-0";
								if(dkiUA.isIE()){
									classes += " col-sm-6 col-md-4";
								}
								return classes;
							}(),
							strings : {
								more : DKI.strings.index.listButtonLabel
							}
						}
						if(this.subeos.length > maxPages && state.design.parameters.config.showAllPages){
							cfg.showAllPages = true;
						}
						$.each(this.subeos,function(i,o){
							cfg.items.push({
								id    : this.subeoid,
								icon  : "fa fa-file-text-o",
								title : this.page.title,
								hidden: i >= maxPages ? true : false
							});
						});
						if(this.subeos.length){
							items.push(cfg);
						}
					});
			});
			cfg.cards = items;
			dom.landing = $(templates.landing(cfg)).appendTo($("body"));
			dom.landing.on(settings.clickEvent,".kb-card #showMore",function(){
				if($(this.parentElement).hasClass('expanded')){
					$(this.parentElement).find('.kb-card-items > li').each(function(i,o){
						if(i >= maxPages){
							$(this).addClass("hidden");
						}
					});
					$(this).find('span').text(DKI.strings.index.listButtonLabel + "...");
					$(this).find('i').removeClass('fa-caret-up').addClass('fa-caret-down');
					$(this.parentElement).removeClass('expanded');
				}else{
					$(this.parentElement).find('.kb-card-items .hidden').each(function(){
						$(this).removeClass("hidden");
					});
					if(state.config.settings.course.courseLanguage.indexOf("en-") > -1){
						$(this).find('span').text("Less...");
					}else{
						$(this).find('span').text(DKI.strings.index.icloseButtonLabel + "...");
					}
					$(this).find('i').removeClass('fa-caret-down').addClass('fa-caret-up');
					$(this.parentElement).addClass("expanded");
				}
				$($(this.parentElement).find('.kb-card-items > li')[0]).focus();
			});
			var leaveSearchPage = DKI.func.debounce(function(){
					$("html").removeClass("in-search-page has-search-results");
					$(".kb-landing-cards .kb-card li").removeClass("hidden hiddenBySearch");
					$(".kb-landing-cards-cont > div").velocity("stop");
					$(".kb-landing-cards-cont > div").css({opacity: 0, display: "none"});
					$(".kb-landing-search .input-group-btn .btn span").addClass("fa-search").removeClass("fa-spinner fa-spin");
					dom.landing.css("top", "");
					dom.landing.css("height", "");
					dom.landing.find(".kb-card").each(function(i,o){
						var card = $(this);
						$(this).parent().velocity("fadeIn", {duration: 500, delay: i * 150});
						card.find("#showMore").show();
						card.find(".kb-card-items li").each(function(i,o){
							if(i >= maxPages){
								$(this).addClass("hidden");
							}
						});
					});
			}, 100, true);
			if(state.design.parameters.config.searchFiltersHome){
				dom.landing.on("focus", ".kb-search-input", function(){
					if(!$("html").hasClass("in-search-page")){
						$("html").addClass("in-search-page");
						var topOffset = dom.landing.find(".kb-courseTitle").outerHeight() + dom.landing.find(".kb-courseDescription").outerHeight() - 20;
						dom.landing.css({top: -topOffset,height:"calc(100% + " + topOffset + "px)"});
					}
				});
				dom.landing.on("blur", ".kb-search-input", function(e){
					if($(this).val() == '' && $("html").hasClass("in-search-page") && e.relatedTarget != $("#navbar_search")[0] && e.relatedTarget != $("#navbar_home")[0]  && $(e.relatedTarget).attr("id") != 'showMore'){
						leaveSearchPage();
					}
				});
				if(state.design.parameters.config.searchAsYouType){
					dom.landing.on("input",".kb-search-input",DKI.func.debounce(function(){
						$(".kb-landing-search .input-group-btn .btn span").removeClass("fa-search").addClass("fa-spinner fa-spin");
						kbSearch();
					}, 500));
				}
			}
			dom.landing.on(settings.clickEvent,".kb-card-items > li",function(){
				$("body").removeClass("kb-landing-show");
				jumpTo($(this).data("id"));
			});+
			dom.header.container.find(".home").on(settings.clickEvent,function(){
				if($("html").hasClass("in-search-page")){
					leaveSearchPage();
				}else{
					$("body").toggleClass("kb-landing-show");
				}
				
				if($("body").hasClass("kb-landing-show") && state.design.parameters.config.searchFiltersHome){
					$(".kb-search-input").val('');
				}
			});
			dom.header.container.find(".search").on(settings.clickEvent,function(){
				if(!$("html").hasClass("in-search-page")){
					$("body").addClass("kb-landing-show");
					$(".kb-search-input").focus();
				}else{
					$("body").toggleClass("kb-landing-show");
				}
			});
			var heroImage = dataStorage.courseStructure.hero_image_id;
			if(heroImage){
				if(DKI.renderService.state.renderEnvironment.export){
					var heroImage = "assets/" + heroImage + "." + dataStorage.courseStructure.hero_image_extension;
				}else{
					var heroImage = state.config.settings.baseUrl + "admin/editor2/AssetManager/asset.cfm/" + heroImage;
				}
			}else {
				if(DKI.renderService.state.renderEnvironment.export){
					heroImage = "./design/resources/landing.png";
				}else{
					heroImage = state.config.settings.baseUrl + "content/authoringToolDB/designs/" + state.design.id + "/resources/landing.png";
				}
			}
			$("<style type=\"text/css\"> .kb-landing-heading-container:after{background-image:url('" + heroImage + "') !important;}</style>").appendTo($("head"));
		};
		var init = function(cfg) {
			state.config = cfg;
			jQuery.fn.centerInWindow = function () {
			    this.css("position","absolute");
			    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
			                                                $(window).scrollTop()) + "px");
			    this.css("left", Math.max(0, (($("body").width() - $(this).outerWidth()) / 2) + 
			                                                $(window).scrollLeft()) + "px");
			    return this;
			};
			$(window).on("resize",function(){
				if(!dom.menu.container.is(":visible")){
					dom.menu.container.find(".tooltipstered").tooltipster("close");
				}
			});
			$("#contentFrame").on("click", function(){if($(window).width() < 900){
					dom.menu.container.hide("slide");
				}});
			dom.menu.buttons.glossary.on("click", function(){if($(window).width() < 900){
					dom.menu.container.hide("slide");
				}});

		contentApi.playerEvent.on('pageLoaded', function(){		
		if($(window).width() < 900){
				dom.menu.container.hide("slide");
			}
			if(dkiUA.isIE()){
				$("html").addClass("is-on-ie");
			}
		});
		if(DKI.renderService.state.renderEnvironment.full){
			renderLanding();
			//For subsequent page changes
			$(dataStorage).on(DKI.DataStorage.events.pageSelected,function(){
				var subeoid = DKI.getURLParameterValue("subeoid", true, true);
				if(subeoid == dataStorage.currentPage.subeoid){
					$("body").removeClass("kb-landing-show");
				}
				dom.menu.container.find(".kb-card, .kb-card li").removeClass("active");
				dom.menu.container.find(".kb-card[data-id=\"" + dataStorage.currentObject.eoid + "\"]").addClass("active");
				dom.menu.container.find(".kb-card li[data-id=\"" + dataStorage.currentPage.subeoid + "\"]").addClass("active");
				var scrollTo = $("#topics .kb-card.active .active");
				var scrollParent = scrollTo.scrollParent();
				var scrollTop = scrollParent.scrollTop() + scrollTo.offset().top - $("#topics").offset().top - 10;
				if(scrollTop < scrollParent.scrollTop() || scrollTop > (scrollParent.scrollTop() + scrollParent.height())){
					if(scrollTop < 0){
						scrollTop = 0;
					}
					scrollParent.scrollTop(scrollTop);
				}
				dom.header.kbInfo.find(".kb-info-header-lo-title").html(dataStorage.currentObject.eodesc);
				dom.header.kbInfo.find(".kb-info-header-page-title").html(dataStorage.currentPage.page.title);
				dom.header.kbInfo.find(".kb-info-header-page-createdOn").html(DKI.formatDate(dataStorage.currentPage.page.datecreated,true));
				if(dom.header.share[0]){
					//Rebuild the URL with only the stuff we want
					var url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '') + (window.location.pathname.charAt(0) === "/" ? "" : "/") + window.location.pathname;
					
					if(window.location.search){
						var existingSubeoID = DKI.getURLParameterValue("subeoid", true, true);
						var urlParams = DKI.getURLParameters();

						url += "?";

						for(key in urlParams){
							if(!isNaN(key) && key == existingSubeoID){
								url += dataStorage.currentPage.subeoid;
							}
							//If subeoid was already specified in the url search params, ignore it. We're going to add a new one at the end reflecting the current subeoid
							else if(key.toLowerCase() == "subeoid"){
								continue;
							}
							else if(urlParams[key]){
								url += key + "=" + urlParams[key];
							}
							else {
								url += key;
							}
							url += "&";
						}
						url += "subeoid=" + dataStorage.currentPage.subeoid;

					}
					else{
						url = url + "?subeoid=" + dataStorage.currentPage.subeoid;
					}
					dom.header.share.data("shareLink",url);
				}
				var next = dataStorage.getNextPage();
				if(next) {
					dom.header.kbInfo.find(".kb-info-header-page-next").css("display","table-cell").html("Next: " + next.page.title).data("id",next.subeoid).data("tab-index", "1");
				}else{
					dom.header.kbInfo.find(".kb-info-header-page-next").css("display","none");
				}
				renderSeeAlso(dataStorage.currentPage);
			});
			if(cfg.design.parameters.config.startWithHomePage){
				$("body").addClass("kb-landing-show");
			}
		}
		

		this.events = {
			themeTranscriptShown: "themeTranscriptShown",
			menuOpened: "themeMenuOpened",
			outlineOpened: "themeOutlineOpened"
		};

		$('#navmenu_language_wrapper').prepend(Handlebars.compile(
				'<a id="navmenu_language" href=\"#\" tabindex=\"1\" class="navmenu-link" aria-label="{{>currentLanguageDisplay}}">' +
					'<i class=\"fa fa-globe\"></i> <span class=\"currentLanguageDisplay\">{{>currentLanguageDisplay}}</span>' +
				'</a>'
		)({
			strings: DKI.strings
		}));
		return this;
	};

		window.Theme = init;
		if(DKI.courseStore){
			var renderIndexes = DKI.func.debounce(function(){
				var index = state.index,
					keys = DKI.getObjectKeys(index).sort(function(a,b){if(a < b) return -1;if(a > b) return 1;return 0;}),
					indices = [];
				$.each(keys,function(){
					var idx = index[this];
					if(state.design.parameters.config.preserveCasing){
						var baseTitle = this
					}else{
						var baseTitle = this.charAt(0).toUpperCase() + this.slice(1,this.length);
					}
					var	title = idx.length > 1 ? baseTitle + " <span>(" + idx.length + ")</span>" : baseTitle;
					indices.push({
						baseTitle : baseTitle,
						title     : title,
						pages     : idx
					});
				});
				dom.menu.index.html(templates.index({indices : indices}));

			},10,false);

			$(document).on(DKI.courseStore.events.loRegistered, function(e, object){
				var cfg = {
					items  : [],
					object : object
				}
				$.each(object.subeos, function(){
					var subeo = this;
					cfg.items.push({
						icon  : "fa fa-file-text-o",
						title : this.page.title,
						id    : subeo.subeoid
					});
				});
				dom.menu.topics.append(templates.card(cfg));
			});
			$(document).on(DKI.courseStore.events.pageRegistered, function(e,page){
				var subeo = dataStorage.getSubeoFromPage(page.id);
				$.each(subeo.page.keywords,function(){
					if(!state.index[this]) {
						state.index[this] = [subeo];
					}else{
						state.index[this].push(subeo);
					}
				});
				renderIndexes();
			});
			//For first load
			$(document).one(DKI.ContentPage.events.started,function(){
				if(!player.isSinglePage){
					dom.menu.container.find(".kb-card, .kb-card li").removeClass("active");
					dom.menu.container.find(".kb-card[data-id=\"" + dataStorage.currentObject.eoid + "\"]").addClass("active");
					renderSeeAlso(dataStorage.currentPage);
				}
			});
			$(document).on(DKI.glossaryBrowse.events.glossaryRegistered, function(event, data) {
				if(!dom.menu.glossary.find("li[data-id=\"" + data.glossaryid + "\"]")[0]){
				//The terms are fired in order of title, so we can just append as we go
					var curChar = data.term.toUpperCase().charAt(0),
					group = dom.menu.glossary.find('[id="dki-kb-glossary-' + curChar + '"]');
					if(!group[0]){
						group = $("<li class=\"panel\"><a href=\"#dki-kb-glossary-" + curChar + "\" tabindex=\"1\">" + curChar +"</a><ul id=\"dki-kb-glossary-" + curChar + "\" class=\"glossaryPanel\"></ul></li>").appendTo(dom.menu.glossary).find("ul.glossaryPanel");
					}
					group.append("<li data-id=\"" + data.glossaryid + "\" tabindex=\"1\">" + data.term + "</li>");
				}
			});
		}
	}();
}else {
	window.Theme = function(){};
	$("html").addClass("KB-disabled");
}
