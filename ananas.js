// ==UserScript==
// @name         Ananas Filter Pro
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Select toppings to filter out pizzas without them (ie. pineapple)
// @author       Niko Salakka
// @match        https://pizza-online.fi/restaurant/
// @grant        none
// ==/UserScript==

var dom_items = document.getElementsByClassName("dish-card h-product menu__item");
var vendor = JSON.parse(document.getElementsByClassName("menu__list-wrapper")[0].dataset.vendor);
var pizzas = get_pizzas(vendor);
var toppings = get_toppings(vendor);
var filters = [];

function has_topping(pizza, topping) {
		if (pizza.description === null) return false;
		return pizza.description.includes(topping);
}

function get_pizzas(vendor) {
		for (var c in vendor.menus[0].menu_categories) {
				var category = vendor.menus[0].menu_categories[c];
				var name = category.name;
				if (name == "Pizzat") return category.products;
		}
		return null;
}

function get_toppings(vendor) {
		var toppings_list = {};
		for (var t in vendor.toppings) {
				var name = vendor.toppings[t].name;
				if (name == "Pizza ainekset") {
						for (var tt in vendor.toppings[t].options) {
								var topping = vendor.toppings[t].options[tt];
								toppings_list[topping.name] = topping.id;
						}
				}
		}
		return toppings_list;
}

function refresh_filter_ui() {
		var filter_links = document.getElementsByClassName("topping-filter");
		for (var i = 0; i < filter_links.length; i++) {
				var filter = filter_links[i].name;
				if (filters.includes(filter)){
						filter_links[i].className = "topping-filter topping-active";
						filter_links[i].href = "#f_r_" + filter;
				}
				else {
						filter_links[i].className = "topping-filter topping-inactive";
						filter_links[i].href = "#f_a_" + filter;
				}
		}
}

var filter_hash = "#f_";
function add_filter() {
		var hash = window.location.hash;
		if (!hash.includes(filter_hash)) return;

		var filter = decodeURIComponent(hash.substring(filter_hash.length));
		var s = filter.split('_');
		var t = s[0];
		var f = s[1];
		if (t == "r" && filters.includes(f)) {
				console.log("Removed filter: " + f);
				filters.splice(filters.indexOf(f), 1);
		}
		else {
				console.log("Added filter: " + f);
				filters.push(f);
		}

		filter_pizzas(pizzas, filters, dom_items);
		refresh_filter_ui();
}


function build_ui() {
		var menu = document.getElementsByClassName("dish-menu-category-list")[0];
		var filter_div = document.createElement('div');
		filter_div.className = "topping-filters";

		for (var t in toppings) {
				var link = document.createElement('a');
				link.className = "topping-filter";
				link.href = "#f_a_" + t;
				link.text = t;
				link.name = t;
				link.id = toppings[t];

				var item = document.createElement('li');
				item.appendChild(link);
				filter_div.appendChild(link);
		}
		menu.appendChild(filter_div);
}

function filter_pizzas(pizzas, filters, dom_items) {
		var available_pizzas = [];
		for (var p = 0; p < pizzas.length; p++) {
				var suitable_toppings = 0;
				filters.forEach(function(filter) {
						if (has_topping(pizzas[p], filter)) {
								suitable_toppings += 1;
						}
				});
				if (suitable_toppings == filters.length) {
						available_pizzas.push(pizzas[p].id);
				}
		}

		for (var i = 0; i < dom_items.length; i++) {
				var item = dom_items[i];
				if (item.dataset.menuCategory != "Pizzat") continue;
				var item_id = parseInt(item.dataset.productId);
				if (available_pizzas.includes(item_id)) {
						item.style.display = 'flex';
				}
				else {
						item.style.display = 'none';
				}
		}
}

(function() {
    'use strict';

		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = '.topping-filters { padding: 0px 5% 2% 5%; text-align: center; } .topping-filter, .topping-inactive { font-size: 1.25rem; color:#333; margin: 0px 0.5rem 0px 0px; display: inline-block; } .topping-filter:hover{color: #00BD72;} .topping-filter.topping-active{color:#00BD72;}';
		document.getElementsByTagName('head')[0].appendChild(style);

		window.onhashchange = function() {
				add_filter();
		};

		build_ui();
})();
