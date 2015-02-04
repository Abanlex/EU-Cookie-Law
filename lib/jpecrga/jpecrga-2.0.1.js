// *************************************************************************
// *                                                                       *
// * (c) 2008-2012 Wolf Software Limited <support@wolf-software.com>       *
// * All Rights Reserved.                                                  *
// *                                                                       *
// * This program is free software: you can redistribute it and/or modify  *
// * it under the terms of the GNU General Public License as published by  *
// * the Free Software Foundation, either version 3 of the License, or     *
// * (at your option) any later version.                                   *
// *                                                                       *
// * This program is distributed in the hope that it will be useful,       *
// * but WITHOUT ANY WARRANTY; without even the implied warranty of        *
// * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
// * GNU General Public License for more details.                          *
// *                                                                       *
// * You should have received a copy of the GNU General Public License     *
// * along with this program.  If not, see <http://www.gnu.org/licenses/>. *
// *                                                                       *
// *************************************************************************

(function($) {

	// **************************
	// * WOLF SOFTWARE CORE		*
	// **************************
	
	if (typeof $.ws === 'undefined') {
		$.ws = function() {};
	}
	
	if (typeof $.ws.core == 'undefined') {
		//console.log("$.ws.core is available as a separate include at https://cdn.wolf-secure.com/jquery/core/");
		$.ws.core = function() {};
	}
	
	if (typeof $.ws.core.debugAlert === 'undefined') {
		$.ws.core.debugAlert = function(template, level, message) {
			var output = template;
			output = output.replace('{MESSAGE}', message).replace('{LEVEL}', level);
			alert(output);
		};
	}
	
	if (typeof $.ws.core.cookies === 'undefined') {
		$.ws.core.cookies = function() {};
	}
	
	if (typeof $.ws.core.cookies.read === 'undefined') {
		$.ws.core.cookies.read = function(name) {
			try {
				var nameEq = name + '=';
				var ca = document.cookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ') {
						c = c.substring(1, c.length);
					}
					if (c.indexOf(nameEq) == 0) {
						return c.substring(nameEq.length, c.length);
					}
				}
			} catch (err) {
				//Ignore any errors, we'll just assume the cookie hasn't been set..
			}
			return null
		};
	}
	
	if (typeof $.ws.core.cookies.write === 'undefined') {
		$.ws.core.cookies.write = function(name, value, days) {
			if (days)
                {
					var date = new Date();
					date.setTime(date.getTime()+(days * 24 * 60 * 60 * 1000));
					var expires = ";expires=" + date.toGMTString();
				}
            else
				var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		};
	}
	
	// **************************
	// * JPECRGA PLUGIN			*
	// **************************
	
	// Deprecated Factory
	if (typeof $.jpecrga === 'undefined') {
		$.jpecrga = function(options) {
			console.log("$.jpecrga will be deprecated at the next minor version, please use $.ws.jpecrga instead");
			return $.ws.jpecrga(options);
		}
	}
	
	// Factory
	if (typeof $.ws.jpecrga === 'undefined') {
		$.ws.jpecrga = function(options) {
			var docElement = $(document);
			if (docElement.data('jpecrga')) return docElement.data('jpecrga');
			var jpecrga = new $.ws.jpecrga.create(options);
			docElement.data('jpecrga', jpecrga);		
		};
	}
		
	//Initialisation
	if (typeof $.ws.jpecrga.create === 'undefined') {
		$.ws.jpecrga.create = function(options) {
			this.settings = $.extend({gaKey: null, debug : false}, $.ws.jpecrga.defaults, options);
			var settings = this.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.create"); }
		
			// Check to see if the integrator has set the gaKey.
			if (settings.debug && settings.gaKey == null) {
				$.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "ERROR", "Setting 'gaKey' not specified.");
				return;
			}
								
			var jpecrga = this;
			
			if (typeof jpecrga.container === 'undefined') {
				jpecrga.container = $('<div id="wsjpecrga" />').addClass('jpecr' + settings.skin);
				$('body').append(jpecrga.container);
			}
			
			if (typeof jpecrga.messageDiv === 'undefined') {
				jpecrga.messageDiv = $('<div />').addClass('jpecrMessage');
				jpecrga.container.append(jpecrga.messageDiv);
				jpecrga.messageDiv.fadeTo(0, 0);
				jpecrga.messageDiv.hide();
			}
			
			if (typeof jpecrga.messageIcon === 'undefined') {
				jpecrga.messageIcon = $('<img src="' + settings.messageIcon + '" alt="" />').addClass('jpecrMessageIcon');
				jpecrga.messageDiv.append(jpecrga.messageIcon);
			}
			
			if (typeof jpecrga.buttonDiv === 'undefined') {
				jpecrga.buttonDiv = $('<div />').addClass('jpecrButtons');
				jpecrga.messageDiv.append(jpecrga.buttonDiv);
			}
			
			if (typeof jpecrga.message === 'undefined') {
				jpecrga.message = $('<div />').addClass('jpecrMessagePara');
				jpecrga.messageDiv.append(jpecrga.message);
			}
									
			if (typeof jpecrga.moreInfoDiv === 'undefined') {
				jpecrga.moreInfoDiv = $('<div />').addClass('jpecrMoreInfo');
				jpecrga.container.append(jpecrga.moreInfoDiv);
				jpecrga.moreInfoDiv.fadeTo(0, 0);
				jpecrga.moreInfoDiv.hide();
			}
						
			// If geolocation is turned on, use API to see if the user is outside the EU
			if (settings.geolocate) {
				$.ws.jpecrga.outsideEU(jpecrga, function() { $.ws.jpecrga.run(jpecrga) });
			} else {
				$.ws.jpecrga.run(jpecrga);
			}
		};
	}
	
	if (typeof $.ws.jpecrga.run === 'undefined') {
		$.ws.jpecrga.run = function(jpecrga) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.run"); }
			
			if ($.ws.core.cookies.read(settings.cookiePrefix + 'outsideEU') == 'true' || $.ws.core.cookies.read(settings.cookiePrefix + 'consent') == 'true' || $.ws.core.cookies.read(settings.cookiePrefix + 'permanentConsent') == 'true') {
				$.ws.jpecrga.inject(jpecrga);
				return;
			}
			if ($.ws.core.cookies.read(settings.cookiePrefix + 'consent') == 'false' || $.ws.core.cookies.read(settings.cookiePrefix + 'permanentConsent') == 'false') {
				return;
			}
			$.ws.jpecrga.display(jpecrga);
		}
	}
	
	if (typeof $.ws.jpecrga.display === 'undefined') {
		$.ws.jpecrga.display = function (jpecrga) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.display"); }
		
			jpecrga.messageIcon.attr('src', settings.messageIcon);
			jpecrga.message.html(settings.message);
			var moreInfo = $('<a href="javascript:void(0)">More Info</a>');
			jpecrga.message.append(moreInfo);
			moreInfo.click(function () {
				$.ws.jpecrga.showHideMore(jpecrga, $(this));
			});
			jpecrga.moreInfoDiv.html(settings.moreInfo + settings.brand);
			
			var noButton = $('<a href="javascript:void(1)">No</a>');
			var yesButton = $('<a href="javascript:void(2)">Yes</a>');
			jpecrga.buttonDiv.html('');
			jpecrga.buttonDiv.append(yesButton);
			jpecrga.buttonDiv.append(noButton);
			noButton.click(function() {
				$.ws.jpecrga.setConsent(jpecrga, false, function() {
					jpecrga.moreInfoDiv.fadeTo(settings.fadeSpeed, 0);
					jpecrga.moreInfoDiv.hide();
					moreInfo.text('More Info');
					$.ws.jpecrga.goPermanent(jpecrga);
				});
			});
			yesButton.click(function() {
				$.ws.jpecrga.setConsent(jpecrga, true, function() {
					jpecrga.moreInfoDiv.fadeTo(settings.fadeSpeed, 0);
					jpecrga.moreInfoDiv.hide();
					moreInfo.text('More Info');
					$.ws.jpecrga.goPermanent(jpecrga);
				});
			});
		
			jpecrga.messageDiv.delay(settings.delayTime).fadeTo(settings.fadeSpeed, 1, function() {yesButton.focus()});
		};
	}
	
	if (typeof $.ws.jpecrga.setConsent === 'undefined') {
		$.ws.jpecrga.setConsent = function(jpecrga, consent, callback) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.setConsent"); }
			$.ws.core.cookies.write(settings.cookiePrefix + 'consent', consent);
			if (consent) {
				$.ws.jpecrga.inject(jpecrga);
			} else if (!consent && settings.noConsentCallback != null) {
				settings.noConsentCallback();
			}
			callback();
		};
	}
	
	if (typeof $.ws.jpecrga.goPermanent === 'undefined') {
		$.ws.jpecrga.goPermanent = function(jpecrga) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.goPermanent"); }
			
			jpecrga.messageIcon.attr('src', settings.permanentMessageIcon);
			jpecrga.message.html(settings.permanentMessage);
			var moreInfo = $('<a href="javascript:void(0)">More Info</a>');
			jpecrga.message.append(moreInfo);
			moreInfo.click(function () {
				$.ws.jpecrga.showHideMore(jpecrga, $(this));
			});
			jpecrga.moreInfoDiv.html(settings.permanentMoreInfo + settings.brand);
			
			var noButton = $('<a href="javascript:void(1)">No</a>');
			var yesButton = $('<a href="javascript:void(2)">Yes</a>');
			jpecrga.buttonDiv.html('');
			jpecrga.buttonDiv.append(yesButton);
			jpecrga.buttonDiv.append(noButton);
			noButton.click(function() {
				$.ws.jpecrga.hide(jpecrga);
			});
			yesButton.click(function() {
				$.ws.jpecrga.setPermanentConsent(jpecrga, $.ws.core.cookies.read(settings.cookiePrefix + 'consent'), function() {
					jpecrga.moreInfoDiv.fadeTo(settings.fadeSpeed, 0);
					moreInfo.text('More Info');
					$.ws.jpecrga.hide(jpecrga);
				});
			});
			
			jpecrga.container.addClass('permanent');
		}
	}
	
	if (typeof $.ws.jpecrga.setPermanentConsent === 'undefined') {
		$.ws.jpecrga.setPermanentConsent = function(jpecrga, consent, callback) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.setPermanentConsent"); }
			$.ws.core.cookies.write(settings.cookiePrefix + 'permanentConsent', consent, 365);
			callback();
		};
	}
	
	if (typeof $.ws.jpecrga.hide === 'undefined') {
		$.ws.jpecrga.hide = function (jpecrga) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.hide"); }
			jpecrga.container.fadeTo(settings.fadeSpeed, 0, function() {
				jpecrga.container.hide();
				jpecrga.container.removeClass('permanent');
			});
		}
	}
	
	if (typeof $.ws.jpecrga.showHideMore === 'undefined') {
		$.ws.jpecrga.showHideMore = function (jpecrga, button) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.showHideMore"); }
			if (button.text() == 'More Info') {
				jpecrga.moreInfoDiv.fadeTo(settings.fadespeed, 1);
				button.text('Less Info');
			} else {
				jpecrga.moreInfoDiv.fadeTo(settings.fadespeed, 0);
				jpecrga.moreInfoDiv.hide();
				button.text('More Info');
			}
		}
	}
	
	if (typeof $.ws.jpecrga.outsideEU === 'undefined') {
		$.ws.jpecrga.outsideEU = function(jpecrga, runCallback) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.outsideEU"); }
			
			//If we already know that this user is outside the EU, run the callback
			if ($.ws.core.cookies.read(settings.cookiePrefix + 'outsideEU') == 'true') {
				runCallback();
				return;
			}
			
			//We don't have a cookie, ask the API via JSONP
			$.getJSON(
				settings.geolocateApi + "?jsoncallback=?",
				function(data) {
					if (!data.iseu) {
						$.ws.core.cookies.write(settings.cookiePrefix + 'outsideEU', 'true');
					}
				}
			).complete(runCallback());
		};
	}
		
	if (typeof $.ws.jpecrga.inject === 'undefined') {
		$.ws.jpecrga.inject = function(jpecrga) {
			var settings = jpecrga.settings;
			if (settings.debug) { $.ws.core.debugAlert($.ws.jpecrga.alertTemplate, "INFO", "Running $.ws.jpecrga.inject"); }
			
			if ($.ws.jpecrga.injected != true) {
				try {
					var gaURL =  (location.href.indexOf('https') == 0 ? 'https://ssl' : 'http://www');
					gaURL += '.google-analytics.com/ga.js';
					$.getScript(gaURL, function () {
						$.pageTracker = _gat._getTracker(settings.gaKey);
						$.pageTracker._initData();
						$.pageTracker._trackPageview();
					});
				} catch (err) {
					console.log('Failed to load Google Analytics: ' + err);
				}
				$.ws.jpecrga.injected = true;
			}
		}
	}
	
	if (typeof $.ws.jpecrga.version === 'undefined') {
		$.ws.jpecrga.version = '2.0.0';
	}
	
	if (typeof $.ws.jpecrga.defaults === 'undefined') {
		$.ws.jpecrga.defaults = {
			delayTime:				1500,
			fadeSpeed:				400,
			messageIcon:			'/lib/jpecrga/exclamation.png',
			message:				'<a href="http://www.wolf-software.com" target=_blank><img style="border: none; vertical-align: middle; margin-right: 5px; margin-top: -2px;" src="./lib/jpecrga/logo.png" alt=" " /></a> Do you consent to receiving Google Analytics cookies? We use these to aid in improving and maintaining our website. We will remember this preference until you close your browser. ',
			permanentMessageIcon: 	'/lib/jpecrga/question.png',
			permanentMessage:		'Would you like us to save your preference permanently? We will remember this preference using a cookie on your machine. ',
			moreInfo:				'<p><b>Google Analytics</b></p><p>This site uses Google Analytics, a web analytics service provided by Google, Inc. Google Analytics sets number of cookies (default is 4) in order to evaluate your use of the site and compile reports for us on activity on the site.</p><p>Google stores the information collected by the cookie on servers in the United States. Google may also transfer this information to third parties where required to do so by law, or where such third parties process the information on Google&apos;s behalf. Google will not associate your IP address with any other data held by Google.</p><p>Google Inc are members of the US Safe Harbor Scheme. This scheme allows the transfer of data from within the EEA to countries that are outside of the EEA without having to enter into a specific data transfer agreement. Companies that sign up to the scheme are deemed to provide adequate protection for personal data transmitted from Europe. Google Inc&apos;s registration is at <a href="http://safeharbor.export.gov/companyinfo.aspx?id=10543" target=_blank>http://safeharbor.export.gov/companyinfo.aspx?id=10543</a>.</p><p>For more information on the cookies set by Google Analytics please go to: <a href="http://code.google.com/apis/analytics/docs/concepts/gaConceptsCookies.html" target=_blank>http://code.google.com/apis/analytics/docs/concepts/gaConceptsCookies.html</a>.</p><p>Google has also created their own opt-out plugin which you can get from: <a href="http://tools.google.com/dlpage/gaoptout" target=_blank>http://tools.google.com/dlpage/gaoptout</a>.</p><p>In addition to the cookies set by Google Analytics, this plugin will create a session based cookie (which will expire when you close your browser) containing a single "true" or "false" value, reflecting your choice.</p>',
			permanentMoreInfo:		'<p><b>Permanent Preference</b></p><p>In order for us to store your preference permanently we will need to set a cookie. This cookie will only contain a "true" or "false" value and nothing more. It is only used to store your preference for this site. Storing your preference permanently will simply stop you being asked this question each time you visit the site but will not effect your ability to use it.</p>',
			skin:					'default',
			cookiePrefix:			'wsjpecrga_',
			noConsentCallback:		null, 
			geolocate:				false, 
			geolocateApi:			'http://api.wolf-software.com/geoip/iseu.php',
			brand:					'<p>Version: ' + $.ws.jpecrga.version + ', Download the Wolf Software Plugin: <a href="http://www.wolf-software.com/Downloads/jpecrga/" target=_blank>Download Link</a>.</p>'
		};
	}
	
	if (typeof $.ws.jpecrga.alertTemplate === 'undefined') {
		$.ws.jpecrga.alertTemplate = "Wolf Software Library Alert: {LEVEL}\n\n{MESSAGE}\n\nTo turn off debugging, either set to false or remove the debug option from your settings.";
	}
	
	
})(jQuery);
