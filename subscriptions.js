import 'onp:global:styles/templates/subscriptions-v2';
import __scrollToY 				from 'onp:helpers/scroll_to_y';
import __settings 				from 'onp:helpers/settings';
// import __checkMazTrackElements 	from 'onp:helpers/check_maz_track_elements';
import __ajax       			from 'onp:helpers/ajax';
import __debounce 				from 'onp:helpers/debounce';

import {TimelineLite, Power1} from 'gsap';

const subscriptions = () => {



	let headblock 		= document.querySelector('.Abo__fiche-headblock'),
		aboLanding 		= document.querySelector('.Abo__listing-container'),
		isMobile 		= __settings.get('isMobile'),
		isTablet 		= __settings.get('isTablet'),
		// isIE11 			= __settings.get('isIE11'),
		carousels		= Array.from(document.querySelectorAll('.ShowsPanel-container.multi')),
		mainContainer 	= document.querySelector('.Abo__fiche-main-container'),
		headContainer   = document.querySelector('.Abo__fiche-headblock-container'),
		// isRing 			= mainContainer && mainContainer.classList.contains('is-ring'),
		// isRingFest 		= mainContainer && mainContainer.classList.contains('ring-fest'),
		// isGrouped		= mainContainer && mainContainer.classList.contains('grouped'),
		// isPageLibre 	= mainContainer && mainContainer.classList.contains('page_libre'),
		isPageGroupe	= mainContainer && mainContainer.classList.contains('page_groupe'),
		isPageIndiv		= mainContainer && mainContainer.classList.contains('page_indiv'),
		isPageJeune 	= mainContainer && mainContainer.classList.contains('page_jeune'),
		isOneOffer      = headContainer && headContainer.classList.contains('simple'),
		isMultiOffers   = headContainer && headContainer.classList.contains('multi'),
		isMultiCarousel = mainContainer && mainContainer.classList.contains('multi-carousel'),
		isMixtes	 	= mainContainer && mainContainer.classList.contains('mixtes'),
		isLyrique	 	= mainContainer && mainContainer.classList.contains('lyrique'),
		isDanse	 		= mainContainer && mainContainer.classList.contains('danse'),
		avantagesDescriptionCtaContainer = document.querySelector('.Avantages-description-cta-container'),
		ctasReady		= new CustomEvent('ctasReady'),
        kpcAlreadyInitialized = false,
        trackingKPC,
		formuleName,
		pageType;

	const header = document.querySelector('.component-main-navigation');
	const titleExpand = document.querySelector('.component-landing-cover__texts-wrapper');
	const timeline = new TimelineLite();

    timeline.fromTo(header, {opacity: 0}, { duration: 2, opacity:1, ease: Power1.easeOut},'=0.5');
    timeline.fromTo(titleExpand, {opacity: 0}, { duration: 2, opacity:1, ease: Power1.easeOut},'-=1.5');

	// USEFULL for scroll to subscription advantage's section
	const scrollToAdvantages = e => {
		e.preventDefault();

		let	headblockHeight 	= document.querySelector('.Abo__fiche-headblock-container').getBoundingClientRect().height,
			headerFixHeight		= document.querySelector('.Abo__fiche-header-fixed').getBoundingClientRect().height;

			// And we also need to take nav and header heights to calculate the final scroll position
			// navHeight			= document.querySelector('.Nav').getBoundingClientRect().height,
			// headerHeight 		= document.querySelector('.Header').getBoundingClientRect().height,

			// @TODO: feature/new-nav refacto: test this!
			let headerHeight;

			if (__settings.get('isMaxTablet')) {
				headerHeight = __settings.get('headMobileHeight');
			} else {
				headerHeight = __settings.get('headDesktopHeight');
			}

			headerHeight = headerHeight + __settings.get('infoBarHeight') + __settings.get('smartBannerHeight');

			// Here is the target
			targetOffset = document.querySelector('.Avantages-container').offsetTop,

			// Here is the final calcuation
			// finalDestination	= targetOffset + headblockHeight - headerFixHeight + navHeight - headerHeight;
			finalDestination = targetOffset + headblockHeight - headerFixHeight - headerHeight;

			// And because of dark structure adaptations plated styles, we have modify the finalDestination
			// (only for desktop)
			if (!isTablet && !isMobile) {
				// finalDestination = finalDestination + headerHeight + navHeight;
				finalDestination = finalDestination + headerHeight;
			}


		__scrollToY({
			el: document,
			offset: finalDestination,
			duration: 750,
			easing: "easeInOut"
		});
	}

	/**
	 * Resized left & right cards by pair
	 *
	 */

	const resizeGridBlockHeight = () => {

		const init = () => {

			const selectors = ['.title-listing', '.main-content'];
			selectors.map(s => resizedLoopEls(s));

		}

		/**
		 * Loop method to resize elements heigth by pair on biggest value
		 * @sel {array} List of css selector
		 *
		 */

		const resizedLoopEls = (sel) => {

			const gridContainer = aboLanding.querySelectorAll('.grid-wrapper__resized');
			if (!gridContainer) return;

			if (__settings.get('isMobile')) {
				// Remove min-height on mobile
				Array.from(gridContainer).map(el => el.querySelectorAll(sel).forEach(block => block.style.minHeight = ''));
				return;
			}

			Array.from(gridContainer).map(el => {
				const blocks = el.querySelectorAll(sel);
				let blockLeftHeight, blockRightHeight;

				blocks.forEach((block, index) => {
					// Check if it's left or right card
					if (index % 2 === 0) {
						blockLeftHeight = block.offsetHeight;
					} else {
						blockRightHeight = block.offsetHeight;
						// Apply min-height on smallest block
						if (blockLeftHeight > blockRightHeight) {
							blocks[index].style.minHeight = blockLeftHeight + 'px';
						} else {
							let prevIndex = index - 1;
							blocks[prevIndex].style.minHeight = blockRightHeight + 'px';
						}

					}

				});

			});
		}

		init();
		window.addEventListener('resize', __debounce(init, 100));
	}

	// USEFULL it seems, to make image object-fit
	// New condition: Like IE11, Edge <= 15 do not support object-fit as well...
	const fitImages = () => {
		if ('objectFit' in document.documentElement.style === false) {
			const elImages = document.querySelectorAll('img[data-object-fit-images]');
			elImages.length && objectFitImages(elImages, {watchMQ: true});
		}
	}

	// USEFULL to show subscription sticky header
	const headerFixedHandler = () => {
		let headerFixed = document.querySelector('.Abo__fiche-header-fixed'),
			headSwitcher = document.querySelector('.component-subscriptions-switcher');

		if (!headerFixed) return;

		let observerOptions = {
				rootMargin: '0px 0px 200px 0px',
				threshold: 0
			};

		let observerHeaderFixed = new IntersectionObserver( target => {
				console.log(target);
			if (target[0].isIntersecting) {

				if (headerFixed.classList.contains('visible')) {
					headerFixed.classList.remove('visible');
				}

			} else {
				headerFixed.classList.add('visible');
			}

		}, observerOptions);

		observerHeaderFixed.observe(headSwitcher);

	}

	const blocks = document.querySelectorAll('.animate-target');

	let observer = new IntersectionObserver( (entries, observer) => {
		entries.forEach( ({isIntersecting, target}) => {
			if(isIntersecting) {
				const image = target.querySelector('.component-subscriptions-card__image');
				image.classList.add('animate-zoom-out');
				observer.unobserve(target)
			}
		})

			
	}, {
		threshold: .1
	});	


	blocks.forEach( block => {
		observer.observe(block)
	});

	/**
	 * Create an observer for each element to detect first entry in view only
	 *
	 */

	const animateStagger = () => {
		const els = aboLanding.querySelectorAll('.animate-stagger');

		if (!els) return;
		if (isMobile) return Array.from(els).map((el) => el.classList.add('intersected'));

		const bindObserver = () => {
			const options = {
				root: null,
				rootMargin: '100px 0px 0px 0px',
				threshold: 0
			};

			const observer = new IntersectionObserver(onIntersection, options);

			Array.from(els).map((el) => observer.observe(el));
		}

		const onIntersection = (entries, observer) => {
			entries.map((entry, index) => {
				// Detect if it's left or rigth card
				if (entry.isIntersecting) {
					if (index % 2 === 0) {
						entry.target.classList.add('intersected');
					} else {
						setTimeout(() => {
							entry.target.classList.add('intersected');
						}, 300);
					}
					observer.unobserve(entry.target);           // Stop observing
				}
			});
		}

		bindObserver();

	}

	// ============================
	// ======= CTA HANDLER ========
	// ============================

	const ajaxWsCtas = () => {

		fetch(window.location.href+"/"+"status").then((response) => {
			if(response.ok){
				return response.json();
			} else {
				console.log("Error fetch status - bad network answer", response);
				return false;
			}
		}).then((res) => {
			const items = res.items;
			console.log("FETCH page's status, items =", items);
			if(!items || items.length){
				dispatchCtas(items);
			}
		}).catch((error) => {
			console.log("Error fetch status", window.location.href+"/"+"status", error);
		});

		// let locationPath = window.location.pathname,
		// 	ajaxDatas,
		// 	urlToCall;

		// if (locationPath.indexOf('/', locationPath.length - 1) !== -1) {
		// 	urlToCall = window.location.pathname + 'status';
		// } else {
		// 	urlToCall = window.location.pathname + '/status';
		// }

		// ajaxDatas = {
		// 	type: 'GET',
		// 	url: urlToCall,
		// 	error: onError,
		// 	success: onSuccess
		// };

		// __ajax(ajaxDatas);

		// function onError(request) {
		// 	console.log('Ajax Call error: ', request);
		// }

		// function onSuccess(request) {
		// 	console.log('Ajax succeed !');

		// 	let response = JSON.parse(request.response);

  //           makeKPCStrings(response.info);

		// 	dispatchCtas(response);
		// }

	}

	const dispatchCtas = (items) => {
		const mainCtasContainer = document.querySelector(".component-subscriptions-switcher__wrapper-cta");
		mainCtasContainer.innerHTML = "";

		const mainTxtContainer = document.querySelector(".component-subscriptions-switcher__wrapper-txt");
		mainTxtContainer.innerHTML = "";

		const mainStickyCtasContainer = document.querySelector(".component-subscriptions-switcher__header-fixed-cta");
		mainStickyCtasContainer.innerHTML = "";

		const sliderContainers = document.querySelectorAll(".section-subscriptions-slider");
		for (let i = 0; i < sliderContainers.length; i++) {
			const ctaContainer = sliderContainers[i].querySelector(".component-subscriptions-slider__wrap-btns");
			ctaContainer.innerHTML = "";
		}

		let ctasArray = [];
		let txtsArray = [];

		if(items.length <= 1){
			const item = items[0];
			for (let i = 0; i < item.buttons.length; i++) {
				const cta = item.buttons[i];
				const tempCta = document.createElement("a");
				tempCta.href = cta.url;
				tempCta.setAttribute("data-type", cta.type);
				tempCta.textContent = cta.text;
				tempCta.classList.add("component-subscriptions-switcher__cta");
				tempCta.classList.add("cta");

				ctasArray.push(tempCta);
				mainCtasContainer.appendChild(tempCta);

				const tempCtaHeader = tempCta.cloneNode(true);
				mainStickyCtasContainer.appendChild(tempCtaHeader);

				if(cta.asteriskText && cta.asteriskText.length > 0){
					const tempParagraph = document.createElement("p");
					tempParagraph.textContent = cta.asteriskText;

					txtsArray.push(tempParagraph);
					mainTxtContainer.appendChild(tempParagraph);
				}
			}
			if(txtsArray.length <= 0){
				mainTxtContainer.remove();
			}
			if(ctasArray.length <= 0){
				mainCtasContainer.remove();
				mainStickyCtasContainer.remove();
			}
		} else {
			// Clear main and sticky section
			mainTxtContainer.remove();
			mainCtasContainer.remove();
			mainStickyCtasContainer.remove();

			for (let i = 0; i < sliderContainers.length; i++) {
				const sliderId = parseInt(sliderContainers[i].getAttribute("data-abo"));
				const item = items.find(data => data.id === sliderId);
				const ctaContainer = sliderContainers[i].querySelector(".component-subscriptions-slider__wrap-btns");
				// Reset Elements Arrays
				txtsArray = [];
				ctasArray = [];

				for (let j = 0; j < item.buttons.length; j++) {
					const cta = item.buttons[j];
					const tempCta = document.createElement("a");
					tempCta.href = cta.url;
					tempCta.setAttribute("data-type", cta.type);
					tempCta.textContent = cta.text;
					tempCta.classList.add("component-subscriptions-switcher__cta");
					tempCta.classList.add("cta");

					ctasArray.push(tempCta);
					ctaContainer.appendChild(tempCta);

					if(cta.asteriskText && cta.asteriskText.length > 0){
						const tempSpan = document.createElement("span");
						tempSpan.textContent = cta.asteriskText;
						tempSpan.classList.add("component-subscriptions-slider__txt");

						txtsArray.push(tempSpan);
					}
				}

				for (let k = 0; k < txtsArray.length; k++) {
					const txtElement = txtsArray[k];
					ctaContainer.appendChild(txtElement);
				}
			}
		}

		window.dispatchEvent(ctasReady, {bubbles: true});

		// let items = response.items;

		// and for carousels cta :
		// check matches with ws return
		// carousels.forEach( carousel => {

		// 	let dataAboCarousel = parseInt(carousel.getAttribute('data-abo'));

		// 	items.forEach( item => {

		// 		if (item.id === dataAboCarousel) {

		// 			// let ctaInfos = item.button;
		// 			// createAndInsertCarouselCta(carousel, ctaInfos, dataAboCarousel);

		// 		}

		// 	});

		// });

		// if (isMultiCarousel) {
		// 	multiCarouselCtaHandler();
		// }

		// window.dispatchEvent(ctasReady, {bubbles: true});

	}

	// ===================================
	// ======= TRACKING FUNCTIONS ========
	// ===================================

    // const initKPC = () => {
    //     let intervalId = setInterval( () => {
    //         let crmTrackScript = document.querySelector('script[src*="crm_tracking.js"]');
    //         // console.log('check : ', crmTrackScript);

    //         if (!kpcAlreadyInitialized && crmTrackScript) {

    //             // normally : crm_tracking script is now surely loaded,
    //             // so we can rise the CRM_TRACKING_LOADED event
    //             var event = document.createEvent('HTMLEvents');
    //             event.initEvent('CRM_TRACKING_LOADED', true, false);
    //             document.dispatchEvent(event);

    //             console.log('rise of CRM_TRACKING_LOADED event from subscription.js');

    //             kpcAlreadyInitialized = true;
    //             clearInterval(intervalId);
    //         }
    //     }, 1000);
    // }

    // const makeKPCStrings = infos => {
    //     // IF/ELSE is a
    //     // Temporary patch, waiting for merge issues fix
    //     if (infos && info.category && info.slug && info.secutix_id) {

    //         let categories = `BILLETTERIE_ABONNEMENTS_${infos.category.toUpperCase()}_${infos.slug.toUpperCase()}_${infos.secutix_id}`;

    //         trackingKPC = {
    //             categories: categories
    //         };

    //     } else {
    //         trackingKPC = {
    //             categories: `BILLETTERIE_ABONNEMENTS_`
    //         };
    //     }
    // }

	// TRACKING DISPATCHERS
	// Be aware that :
	// - the event 'multiCarouselPaginationUpdated' is dispatched in subscription_shows_panel.js
	// const trackingLayerForMultiCarousel = (cta, carousel) => {
	// 	// Please pay attention : this function return the cta yes
	// 	// + the code below's goal is to INITIALISE data-attributes for tracking
	// 	// (datatrack-key and data-track-params)

	// 	let dataTrackKeyString 	= '',
	// 		sectionName 		= carousel.querySelector('.ShowsPanel__title h3 span:nth-of-type(2)').innerText.trim(),
	// 		dotsContainer 		= carousel.querySelector('.flickity-page-dots'),
	// 		arrows				= Array.from(carousel.querySelectorAll('.flickity-prev-next-button'));

	// 	if (pageType === 'Jeunes') {
	// 		dataTrackKeyString = 'aboFicheJeunesMultiCarouselCta';
	// 	}

	// 	cta.setAttribute('data-track-key', dataTrackKeyString);

	// 	// selon mixte-lyrique : updater le data-track-params like this :
	// 	cta.setAttribute('data-track-params', `
	// 		[
	// 			{
	// 				"keyObject": "eventCategory",
	// 				"params":
	// 					[
	// 						{
	// 							"key": "mixte-libre",
	// 							"value": "${formuleName}"
	// 						}
	// 					]
	// 			},
	// 			{
	// 				"keyObject": "eventLabel",
	// 				"params":
	// 					[
	// 						{
	// 							"key": "sectionName",
	// 							"value": "${sectionName}"
	// 						}
	// 					]
	// 			}
	// 		]`);

	// 	const updatePaginationTrackParams = (elem, type) => {

	// 		let trackParams 	= JSON.parse(cta.getAttribute('data-track-params')),
	// 			paginationCount = elem.getAttribute('data-track-pagination'),
	// 			eventLabelFound = false,
	// 			trackFileLabel;

	// 		if (isPageJeune) {
	// 			trackFileLabel 	= type === 'dot' ? 'aboFicheJeunesPaginationBullet' : 'aboFicheJeunesPaginationArrow';
	// 		}

	// 		trackParams.push(
	// 			{
	// 				"keyObject": "eventAction",
	// 				"params":
	// 					[
	// 						{
	// 							"key": "sectionName",
	// 							"value": `${sectionName}`
	// 						},
	// 						{
	// 							"key": "valeurDynamique",
	// 							"value": `${paginationCount}`
	// 						}
	// 					]
	// 			});

	// 		// update eventLabel
	// 		trackParams.forEach( obj => {

	// 			if (obj.keyObject === 'eventLabel') {

	// 				obj.params.forEach( params => {

	// 					if(params.key === 'valeurDynamique') {

	// 						params.value = paginationCount;
	// 						eventLabelFound = true;

	// 					}

	// 				});

	// 				if (!eventLabelFound) {
	// 					obj.params.push({
	// 						key: "valeurDynamique",
	// 						value: paginationCount
	// 					});
	// 				}

	// 			}

	// 		});

	// 		elem.setAttribute('data-track-key', trackFileLabel);
	// 		elem.setAttribute('data-track-params', JSON.stringify(trackParams));

	// 	}

	// 	// PAGINATION ACTIONS
	// 		// bullets
	// 	if (dotsContainer) {
	// 		let dots = Array.from(dotsContainer.querySelectorAll('.dot'));
	// 		dots.forEach( dot => updatePaginationTrackParams(dot, 'dot') );
	// 	}

	// 		// arrows
	// 	if (arrows) {
	// 		arrows.forEach( arrow => updatePaginationTrackParams(arrow, 'arrow') );
	// 	}


	// 	cta.classList.add('maz-track-js');
	// 	return cta;
	// }

	const updateArrowTrackingPagination = (paginationValue, idCarousel) => {
		// + the code below's goal is to DYNAMISE data-attributes for tracking (datatrack-key and data-track-params)
		let carousel 			= document.querySelector(`.ShowsPanel-container[data-abo="${idCarousel}"]`),
			arrow 				= carousel.querySelector('.flickity-prev-next-button.next');

		if (!arrow) return;

		let	arrowTrackParams 	= JSON.parse(arrow.getAttribute('data-track-params')),
			eventLabelFound		= false,
			eventActionFound	= false;

			// we go check data-track-params of the nextArrow to update them
			arrowTrackParams.forEach( obj => {

				// EVENTLABEL
				if (obj.keyObject === 'eventLabel') {

					obj.params.forEach( params => {

						if (params.key === 'valeurDynamique') {
							params.value = paginationValue;
							eventLabelFound = true;
						}

					});

					if (!eventLabelFound) {
						obj.params.push({
							key: "valeurDynamique",
							value: paginationValue
						});
					}

				}

				// EVENTACTION
				if (obj.keyObject === 'eventAction') {

					obj.params.forEach( params => {

						if (params.key === 'valeurDynamique') {
							params.value = paginationValue;
							eventActionFound = true;
						}

					});

					if (!eventActionFound) {
						obj.params.push({
							key: "valeurDynamique",
							value: paginationValue
						});
					}

				}

			});

			arrow.setAttribute('data-track-params', JSON.stringify(arrowTrackParams));

	}

	// ================================
	// ======= EVENT LISTENERS ========
	// ================================

	const initCustomEvents = () => {

		window.addEventListener('ctasReady', () => {
			// made to avoid flickering during replacement
			// headblockCta.classList.add('is-ready');

			// add tracking keys
			// trackingKeysDispatchCtas();

			// dynamise tracking params
			// trackingParamsDispatchCtas();

			// launch checkMazTrackElements
			// __checkMazTrackElements();

            // launch KPC tracking init
            // initKPC();
		});

		window.addEventListener('multiCarouselPaginationUpdated', function(e) {
			let paginationValue = e.detail.paginationValue,
				idCarousel		= e.detail.idCarousel;

			updateArrowTrackingPagination(paginationValue, idCarousel);
		});

	}

	// ========================
	// ======= HELPERS ========
	// ========================

	const setFormuleLabel = () => {
		if (isMixtes) {
			formuleName = 'mixtes'
		} else if (isLyrique) {
			formuleName = 'lyrique'
		} else if (isDanse) {
			formuleName = 'danse'
		} else {
			return;
		}
	}

	const setPageType = () => {
		if (isPageGroupe) {
			pageType = 'Group';
		} else if (isPageIndiv) {
			pageType = 'Indiv';
		} else if (isPageJeune) {
			pageType = 'Jeunes';
		}
	}

	// META INITIALIZACIONS
	const metaInit = () => {

		if (aboLanding) {

			// LANDING ONLY
			fitImages();
			animateStagger();
			resizeGridBlockHeight();
			// __checkMazTrackElements();
            // initKPC();

		} else {

			// FICHE ABO ONLY
			initCustomEvents();
			setFormuleLabel();
			setPageType();

			// Ajax CTA's infos
			ajaxWsCtas();

			// if (!isPageLibre) {
			// 	ajaxWsCtas();
			// } else {
			// 	// si !isPageLibre, le dispatch se fait une fois que l'appel ajax et
			// 	// les process associés sont ok
			// 	window.dispatchEvent(ctasReady, {bubbles: true});
			// }


			// if (isMobile && !isMultiCarousel) {
			// 	ctaMobileHandler();
			// }

			// if (!isMobile) {
			// 	ctaAvantagesHandler();
			// }

			// if (isRing) {
			// 	headblockRingSwitcherManager();
			// }

			// zoomHeadPictureHandler();

			headerFixedHandler();

			headblock && headblock.querySelector('#see-all-advantages').addEventListener('click', scrollToAdvantages);
		}
	}

	metaInit();

	// const ctaMobileHandler = () => {

	// 	let container 	= document.querySelector('.Abo__fiche-main-container');
	// 	if (!container) return;

	// 	let cta 		= container.querySelector('.headblock-cta'),
	// 		mobileWidth	= 767,
	// 		isMobile	= window.innerWidth < mobileWidth;

	// 	const init = () => {
	// 		window.addEventListener('resize', adaptationsDispatcher);
	// 		adaptationsDispatcher();
	// 	}

	// 	const adaptationsDispatcher = () => {
	// 		isMobile = window.innerWidth < mobileWidth;

	// 		if (isMobile) {
	// 			desktopToMobile();
	// 		} else {
	// 			mobileToDesktop();
	// 		}
	// 	}

	// 	const desktopToMobile = () => {
	// 		container.insertAdjacentElement('afterbegin', cta);
	// 	}

	// 	const mobileToDesktop = () => {
	// 		let headblockWedge = container.querySelector('.headblock-bottomlinks');
	// 		headblockWedge.insertAdjacentElement('beforebegin', cta);
	// 	}

	// 	init();
	// }

	// const ctaAvantagesHandler = () => {

	// 	let ctaContainer 		= document.querySelector('.Avantages-description-cta-container'),
	// 		showsPanelIsThere 	= document.querySelector('.ShowsPanel-container');
	// 	if (!ctaContainer) return;

	// 	let	targetElement 	= showsPanelIsThere ? document.querySelector('.Avantages-container') : document.querySelector('.Avantages-description'),
	// 		wedge 			= document.querySelector('.cta-wedge'),
	// 		ctaContainerSize = window.getComputedStyle(ctaContainer).getPropertyValue('height');

	// 	const intersectionInit = () => {
	// 		// Here we need 2 observers :
	// 		// 	1st : to detect the entrance/exit of the Avantages-container
	// 		// 	2nd : to detect the entrance/exit of the wedge
	// 		//
	// 		//  1st : give sticky + add enter class
	// 		//  2nd : remove sticky + add leave class ( to put back cta in position relative )
	// 		//
	// 		//  nb : the wedge height is set/unset to avoid flickering due to its fixed position
	// 		// 	nb2 : the wedge need a .is-ready to avoid cta apparition at load

	// 		setTimeout(() => {
	// 			wedge.classList.add('is-ready');
	// 		}, 100);


	// 		let observerPutOptions = {
	// 				rootMargin: '0px 0px 100px 0px',
	// 				threshold: 0
	// 			},
	// 			observerRemoveOptions = {
	// 				rootMargin: '0px 0px -80px 0px',
	// 				threshold: 0
	// 			};

	// 		let observerPutStick = new IntersectionObserver( target => {

	// 			if (target[0].isIntersecting) {

	// 				ctaContainer.classList.add('sticked');

	// 				ctaContainer.classList.add('sticked-anim-enter');

	// 				wedge.style.height = ctaContainerSize;

	// 				setTimeout(() => {
	// 					ctaContainer.classList.remove('sticked-anim-enter');
	// 				}, 450);

	// 			} else {

	// 				ctaContainer.classList.add('sticked-anim-leave');

	// 				setTimeout(() => {

	// 					ctaContainer.classList.remove('sticked-anim-leave');

	// 					if (ctaContainer.classList.contains('sticked')) {
	// 						ctaContainer.classList.remove('sticked');
	// 						wedge.style.height = 0;
	// 					}

	// 				}, 450);

	// 			}

	// 		}, observerPutOptions);

	// 		let observerRemoveStick = new IntersectionObserver( target => {

	// 			if (target[0].isIntersecting) {

	// 				if (ctaContainer.classList.contains('sticked')) {
	// 					ctaContainer.classList.remove('sticked');
	// 					wedge.style.height = 0;
	// 				}

	// 			} else {

	// 				if (wedge.classList.contains('is-ready')) {

	// 					ctaContainer.classList.add('sticked');
	// 					wedge.style.height = ctaContainerSize;

	// 				}

	// 			}

	// 		}, observerRemoveOptions);

	// 		observerPutStick.observe(targetElement);
	// 		observerRemoveStick.observe(wedge);

	// 	}

	// 	setTimeout(() => {

	// 		intersectionInit();

	// 	}, 2000);

	// }

	// const zoomHeadPictureHandler = () => {

	// 	const zoomedPicture = document.querySelector('.Abo__fiche-headpicture img');
	// 	if (!zoomedPicture || isIE11) return;

	// 	let scrollY = window.scrollY || window.pageYOffset;
	// 	let ticking = false;
	// 	let scale = 1;

	// 	const animate = (scl, scroll) => {

	// 		if (!ticking) {
	// 			requestAnimationFrame(() => {

	// 				zoomedPicture.style.transform = `scale(${scl}) translate3d(0, ${scroll}px, 0)`;
	// 				ticking = false;
	// 			});
	// 		}

	// 		ticking = true;
	// 	}


	// 	window.addEventListener('scroll', e => {

	// 		scrollY = window.scrollY || window.pageYOffset;
	// 		scale = 1 + Math.floor((scrollY * 100) / 670) / 1000;

	// 		animate(scale, scrollY);

	// 	});
	// }

	// const headblockRingSwitcherManager = () => {
	// 	let links	= headblock.querySelectorAll('.ring-switcher-container a');

	// 	const resetSelected = () => {

	// 		links.forEach( oneLink => {
	// 			if (oneLink.classList.contains('selected')) {
	// 				oneLink.classList.remove('selected');
	// 			}
	// 		});

	// 	}

	// 	links.forEach( oneLink => {

	// 		oneLink.addEventListener('click', (e) => {

	// 			e.preventDefault();

	// 			resetSelected();

	// 			e.target.classList.add('selected');

	// 			setTimeout(() => {
	// 				window.location = e.target.getAttribute('href');
	// 			}, DELAY_RING_SWITCHER / 2);

	// 		});

	// 	});
	// }

	// const resetHeadblockCtas = () => {
	// 	headblockCta.innerHTML 						= '';
	// 	avantagesDescriptionCtaContainer.innerHTML 	= '';
	// }

	// const createAndInsertHeadblockCta = (items) => {

	// 	let ctasToInsert = [],
	// 		firstCta,
	// 		secondCta;

	// 	resetHeadblockCtas();

	// 	if (!isGrouped || (isGrouped && isRing) ) {

	// 		items.forEach( item => {

	// 			let cta 			= document.createElement('a'),
	// 				duplicatedCta,
	// 				classesToPut 	= ['Button', 'maz-track-js', item.button.type];

	// 			multiClassesIeManualPolyfill(cta, classesToPut);

	// 			if (item.button.text) {
	// 				cta.innerHTML = item.button.text;
	// 			}

	// 			if (item.button.url) {
	// 				cta.setAttribute('href', item.button.url);
	// 			}

	// 			if (item.button.type === 'CTABook') {
	// 				cta.classList.add('Button--black');
	// 			}

	// 			duplicatedCta = cta.cloneNode(true);


	// 			// duplicatedCta.setAttribute('data-track-key', 'aboFicheCtaBottom');

	// 			ctasToInsert.push({cta, duplicatedCta});
	// 		});

	// 		// when we have 2 cta strictly identicals, we need to render only one
	// 		// !!! only for Ring
	// 		// !!! exept for .CTBook
	// 		firstCta 	= ctasToInsert[0].cta;

	// 		if (ctasToInsert[1]) {
	// 			secondCta 	= ctasToInsert[1].cta;
	// 		}

	// 		// if the cta is empty, we do not insert it
	// 		if (firstCta.innerText) {

	// 			if (isRing
	// 				 && ( !firstCta.classList.contains('CTABook') || !firstCta.classList.contains('CTAOption') )
	// 				 && secondCta
	// 				 && ( firstCta.innerText !== secondCta.innerText)
	// 				 ) {

	// 				ctasToInsert.forEach( ctaCouple => {

	// 					headblockCta.appendChild(ctaCouple.cta);
	// 					avantagesDescriptionCtaContainer.appendChild(ctaCouple.duplicatedCta);

	// 				});

	// 			} else {

	// 				if (headblockCta.classList.contains('is-multiple')) {
	// 					headblockCta.classList.remove('is-multiple');
	// 				}

	// 				headblockCta.appendChild(ctasToInsert[0].cta);
	// 				avantagesDescriptionCtaContainer.appendChild(ctasToInsert[0].duplicatedCta);
	// 			}
	// 		}

	// 		// Call the function that will hide the 2 ctas and create 1 to display them
	// 		if (isRingFest && isMobile) {
	// 			ringFestMobileDoubleCtaHandler();
	// 		}

	// 		window.dispatchEvent(ctasReady, {bubbles: true});
	// 	}

 //        // distribute KPC tracking attributes
 //        if (ctasToInsert.length > 0) {
 //            distributeKPCAttributes(ctasToInsert);
 //        }


	// }

    // const distributeKPCAttributes = ctasToInsert => {
    //     ctasToInsert.forEach( ctaToInsert => {
    //         let keys = Object.keys(ctaToInsert);

    //         keys.forEach( key => {

    //             let currentCta = ctaToInsert[key];
    //             let tag = 'key à définir';
    //             let value;

    //             if (currentCta.classList.contains('CTABook')) {
    //                 tag = "SABONNER";
    //                 value = "ABONNER";
    //             } else {
    //                 value = trackingKPC.categories;
    //             }

    //             currentCta.setAttribute('data-tracking-tag', tag);
    //             currentCta.setAttribute('data-tracking-categories', value);
    //         });
    //     });
    // }

	// const multiClassesIeManualPolyfill = (el, classArr) => {
	// 	// We could have put these classes in one single line
	// 	// but we must .. SUPPORT IE11    u_u'
	// 	classArr.forEach( oneClass => {
	// 		el.classList.add(oneClass);
	// 	});
	// }

	// const createAndInsertCarouselCta = (carousel, ctaInfos, dataAboCarousel) => {
	// 	// function called in a loop

	// 	// ok, so let's create this cta
	// 	let ctaContainer 	= document.createElement('div'),
	// 		cta 			= document.createElement('a'),
	// 		// the wedge is '__box' because others potential wedges comes with instanciation,
	// 		// which is too late sometimes (__box is straight in the DOM because straight in the tpl)
	// 		wedge 			= carousel.querySelector('.ShowsPanel__box'),
	// 		classesToPut	= ['Button', 'Button--black', ctaInfos.type];

	// 	ctaContainer.classList.add('multiCarouselCtaContainer');
	// 	ctaContainer.setAttribute('data-abo', dataAboCarousel);


	// 	multiClassesIeManualPolyfill(cta, classesToPut);

	// 	if (ctaInfos.url !== '') cta.setAttribute('href', ctaInfos.url);

	// 	cta.innerText = ctaInfos.text;

	// 	// add tracking infos
	// 	cta = trackingLayerForMultiCarousel(cta, carousel);


	// 	// let's plug cta in his container
	// 	ctaContainer.appendChild(cta);
	// 	// and let's insert this ctaContainer in his carousel
	// 	if (wedge) wedge.insertAdjacentElement('afterend', ctaContainer);

	// }

	// const ringFestMobileDoubleCtaHandler = () => {
	// 	// that function will hide the 2 ctas and create 1 trigger to display/undisplay them

	// 	let ctas 			= Array.from(headblockCta.querySelectorAll('a')),
	// 		ctaTrigger 		= document.createElement('a'),
	// 		whiteMask		= document.createElement('div');

	// 	// This whole function is needed only if there is 2 or more CTAs
	// 	if (ctas.length < 2 ) return;

	// 	const revealHandler = e => {
	// 		headblockCta.classList.toggle('revealed');
	// 	};

	// 	// 1 - d'abord on consitute le cta "réserver" qui va servir de trigger
	// 	ctaTrigger.className = ctas[0].className;
	// 	ctaTrigger.setAttribute('data-track-key', "aboFicheCtaTop");
	// 	ctaTrigger.classList.add('ctaFestTrigger');
	// 	ctaTrigger.innerText = 'Réserver';

	// 	// 2 - on met une class undercover sur les ctas qui étaient déjà en place
	// 	ctas.forEach( (oneCta, i) => {
	// 		oneCta.classList.add('undercover');
	// 		oneCta.classList.add('undercover__' + i);
	// 	});


	// 	// 3 - on insère le trigger dans le headblockCta au dessus de tous les autres
	// 	headblockCta.insertAdjacentElement('afterbegin', ctaTrigger);

	// 	// 4 - on insère le whitemask
	// 	whiteMask.classList.add('white-mask');
	// 	headblockCta.insertAdjacentElement('afterbegin', whiteMask);

	// 	// 5 - on lance les listeners
	// 	whiteMask.addEventListener('click', revealHandler);
	// 	ctaTrigger.addEventListener('click', revealHandler);

	// }

	// const multiCarouselCtaHandler = () => {
	// 	if (!isMobile) return;

	// 	let ctasCarousels = Array.from(document.querySelectorAll('.multiCarouselCtaContainer')),
	// 		multiCarouselSingleCtaContainer = document.createElement('div'),
	// 		singleCta;

	// 	// on cache tous ces cta de sliders
	// 	ctasCarousels.forEach( oneCta => {
	// 		oneCta.style.display = 'none';
	// 	});

	// 	if (ctasCarousels.length) {
	// 		// on créé un cta unique
	// 		singleCta = ctasCarousels[0].querySelector('a').cloneNode(true);
	// 		// on l'insère dans son container (fixe + bas de page)
	// 		multiCarouselSingleCtaContainer.appendChild(singleCta);

	// 		// on spécifie 2 - 3 trucs pour le container
	// 		multiCarouselSingleCtaContainer.classList.add('multiCarouselSingleCtaContainer');

	// 		// on insère le container dans le DOM
	// 		mainContainer.insertAdjacentElement('beforeend', multiCarouselSingleCtaContainer);

	// 		// enfin, (si isMobile) on initialise les observers
	// 		multiCarouselIntersectionManager({ctasCarousels, singleCta});
	// 	}
	// }

	// const multiCarouselIntersectionManager = obj => {
	// 	let carousels 			= Array.from(document.querySelectorAll('.ShowsPanel-container.multi')),
	// 		singleCta			= mainContainer.querySelector('.multiCarouselSingleCtaContainer a'),
	// 		aboFicheBody		= mainContainer.querySelector('.Abo__fiche-body');
	// 		// avantagesContainer	= aboFicheBody.querySelector('.Avantages-container'),
	// 		// heightAvantages		= avantagesContainer.getBoundingClientRect().height;

	// 	let optionsObserver = {
	// 			root: null,
	// 			threshold: 0.75
	// 		};

	// 	const carouselObserverHandler = e => {
	// 		// vérifier l'intersecting
	// 		if (e[0].isIntersecting) {


	// 			let accurateTarget 		= e[0].target.querySelector('.multiCarouselCtaContainer a'),
	// 				hrefToUpdate 		= accurateTarget.getAttribute('href'),
	// 				classNameToUpdate 	= accurateTarget.className,
	// 				htmlToUpdate 		= accurateTarget.innerHTML;

	// 			// transmettre les infos du cta classic au cta single en bas de page
	// 			singleCta.setAttribute('href', hrefToUpdate);
	// 			singleCta.className = classNameToUpdate;
	// 			singleCta.innerHTML = htmlToUpdate;

	// 			// on fait flasher le boutton pour signifier visuellement qu'il a été updaté
	// 			singleCta.classList.add('flashlight');
	// 			setTimeout( () => {
	// 				singleCta.classList.remove('flashlight');
	// 			}, 150);

	// 			if (!singleCta.parentNode.classList.contains('visible') &&
	// 				singleCta.parentNode.classList.contains('is-ready')) {

	// 				singleCta.parentNode.classList.add('visible');
	// 			}
	// 		}
	// 	}

	// 	const aboFicheObserverHandler = e => {
	// 		if (e[0].isIntersecting) {
	// 			// console.log('on intersecte bien');
	// 			singleCta.parentNode.classList.add('is-ready');

	// 		} else {
	// 			// console.log('finie l intersection');
	// 			singleCta.parentNode.classList.remove('is-ready');
	// 		}
	// 	};

	// 	carousels.forEach( carousel => {
	// 		// on initialise un observer pour chaque slider
	// 		let carouselObserver = new IntersectionObserver(carouselObserverHandler, optionsObserver);
	// 		carouselObserver.observe(carousel);
	// 	});

	// 	// pour désafficher le singlectacontainer, nous allons mettre un observer sur Abo__fiche-body
	// 	let aboFicheBodyObserver = new IntersectionObserver(aboFicheObserverHandler)
	// 	aboFicheBodyObserver.observe(aboFicheBody);
	// }

	// const trackingKeysDispatchCtas = () => {

	// 	let ctaTopArr 		= Array.from(document.querySelectorAll('.headblock-cta a')),
	// 		ctaBottomArr	= Array.from(document.querySelectorAll('.Avantages-description-cta-container a')),
	// 		subCtaArr		= Array.from(document.querySelectorAll('.ring-switcher-container a')),
	// 		liensUtiles		= Array.from(document.querySelectorAll('.headblock-bottomlinks a'));

	// 	// CTAS
	// 	// if (pageType === 'Ring' || pageType === 'Indiv') {

	// 	// 	// HOTFIX RING ou INDIV CTA
	// 	// 	ctaTopArr.forEach( cta => {

	// 	// 		if (cta.classList.contains('maz-track-js')) {
	// 	// 			cta.classList.remove('maz-track-js');
	// 	// 		}

	// 	// 	});
	// 	// 	ctaBottomArr.forEach( cta => {

	// 	// 		if (cta.classList.contains('maz-track-js')) {
	// 	// 			cta.classList.remove('maz-track-js');
	// 	// 		}

	// 	// 	});
	// 	// } else {

	// 		ctaTopArr.forEach( cta => cta.setAttribute('data-track-key', `aboFiche${pageType}CtaTop`) );
	// 		ctaBottomArr.forEach( cta => cta.setAttribute('data-track-key', `aboFiche${pageType}CtaBottom`) );

	// 	// }

	// 	// SUBCTAS (only ring)
	// 	if (subCtaArr) {
	// 		subCtaArr.forEach( subCta => {
	// 			subCta.setAttribute('data-track-key', `aboFiche${pageType}SubCta`);
	// 			subCta.classList.add('maz-track-js');
	// 		});
	// 	}

	// 	// LIENS UTILES
	// 	liensUtiles.forEach( lien => {
	// 		if (pageType === 'Group') {
	// 			lien.setAttribute('data-track-key', `aboFiche${pageType}LiensUtiles`);
	// 		} else {
	// 			lien.setAttribute('data-track-key', `aboFicheLiensUtiles`);
	// 		}
	// 		lien.classList.add('maz-track-js');
	// 	});



	// }

	// const trackingParamsDispatchCtas = () => {

		// PAGE_GROUPE
		// if (pageType === 'Group') {

		// // 	CTAS
		// 	let ctasGroup = Array.from(document.querySelectorAll('a[data-track-key^="aboFicheGroupCta"]'));
		// 	let sectionName = document.querySelector('.Abo__fiche-headblock .headblock-subtitle').innerText;
		// 	let paramsToInsert = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "sectionName",
		// 							"value": "${sectionName}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 	// to get a line in the DOM instead of a templated string
		// 	paramsToInsert = JSON.stringify(JSON.parse(paramsToInsert));

		// 	ctasGroup.forEach( cta => {
		// 		cta.setAttribute('data-track-params', paramsToInsert);
		// 	});


		// // 	#DOWNLOAD-PDF BUTTON (download formulaire)
		// 	let downloadFormBtnsArr = Array.from(document.querySelectorAll('a[data-track-key^="aboFicheGroupDownload"]'));
		// 	let paramsDownloadForm = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "sectionName",
		// 							"value": "${sectionName}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 	// to get a line in the DOM instead of a templated string
		// 	paramsDownloadForm = JSON.stringify(JSON.parse(paramsDownloadForm));

		// 	downloadFormBtnsArr.forEach( button => {
		// 		button.setAttribute('data-track-params', paramsDownloadForm);
		// 	});


		// // 	LIENS UTILES BUTTONS
		// 	let liensUtilesArr = Array.from(document.querySelectorAll('a[data-track-key="aboFicheGroupLiensUtiles"]'));
		// 	let aboType = document.querySelector('.Abo__fiche-headblock .headblock-title').innerText;

		// 	liensUtilesArr.forEach( lien => {

		// 		let paramsLiensUtiles = [
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "aboType",
		// 							"value": aboType
		// 						},
		// 						{
		// 							"key": "sectionName",
		// 							"value": sectionName
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 					"params":
		// 						[
		// 							{
		// 								"key": "buttonName",
		// 								"value": lien.getAttribute('id')
		// 							}
		// 						]
		// 			}
		// 		];

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsLiensUtiles = JSON.stringify(paramsLiensUtiles);
		// 		lien.setAttribute('data-track-params', paramsLiensUtiles);

		// 	});

		// }

		// PAGE INDIV
		// if (pageType === 'Indiv') {
		// 	// CTAS
		// 	let ctasIndiv = Array.from(document.querySelectorAll('a[data-track-key^="aboFicheIndivCta"]'));
		// 	let aboType = document.querySelector('.Abo__fiche-headblock .headblock-subtitle');
		// 	if (aboType) {
		// 		aboType = aboType.innerText;
		// 		aboType = aboType.split(' ').join('_');
		// 	}


		// 	ctasIndiv.forEach( cta => {
		// 		let ctaText = cta.innerText;

		// 		let paramsToInsert = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "nomAbo",
		// 							"value": "${aboType}"
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "ctaText",
		// 							"value": "${ctaText}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsToInsert = JSON.stringify(JSON.parse(paramsToInsert));

		// 		cta.setAttribute('data-track-params', paramsToInsert);
		// 	});

		// 	// LIENS UTILES BUTTONS
		// 	let liensUtilesArr = Array.from(document.querySelectorAll('a[data-track-key="aboFicheLiensUtiles"]'));

		// 	liensUtilesArr.forEach( lien => {

		// 		let paramsLiensUtiles = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "nomAbo",
		// 							"value": "${aboType}"
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "buttonName",
		// 							"value": "${lien.getAttribute('id')}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsLiensUtiles = JSON.stringify(JSON.parse(paramsLiensUtiles));
		// 		lien.setAttribute('data-track-params', paramsLiensUtiles);

		// 	});
		// }

		// PAGE RING
		// if (pageType === 'Ring') {

		// 	// CTAS
		// 	let ctasGroup = Array.from(document.querySelectorAll('a[data-track-key^="aboFicheRingCta"]'));

		// 	ctasGroup.forEach( cta => {

		// 		let paramsToInsert = `
		// 		[
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "ctaText",
		// 							"value": "${cta.innerText.replace('\n', ' ')}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsToInsert = JSON.stringify(JSON.parse(paramsToInsert));

		// 		cta.setAttribute('data-track-params', paramsToInsert);
		// 	});

		// 	// SOUS-NAV (abo/fest)
		// 	let subCtas = Array.from(document.querySelectorAll('.ring-switcher-container a'));

		// 	subCtas.forEach( subCta => {
		// 		let paramsToInsert = `
		// 			[
		// 				{
		// 					"keyObject": "eventLabel",
		// 					"params":
		// 						[
		// 							{
		// 								"key": "ctaText",
		// 								"value": "${subCta.innerText}"
		// 							}
		// 						]
		// 				}
		// 			]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsToInsert = JSON.stringify(JSON.parse(paramsToInsert));

		// 		subCta.setAttribute('data-track-params', paramsToInsert);
		// 	});

		// 	// LIENS UTILES
		// 	let liensUtilesArr = Array.from(document.querySelectorAll('a[data-track-key="aboFicheLiensUtiles"]'));
		// 	let aboType = document.querySelector('.Abo__fiche-headblock .headblock-title');
		// 	if (aboType) {
		// 		aboType = aboType.innerText;
		// 		aboType = aboType.split(' ').join('_');
		// 	}

		// 	liensUtilesArr.forEach( lien => {

		// 		let paramsLiensUtiles = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "nomAbo",
		// 							"value": "${aboType}"
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "buttonName",
		// 							"value": "${lien.getAttribute('id')}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsLiensUtiles = JSON.stringify(JSON.parse(paramsLiensUtiles));
		// 		lien.setAttribute('data-track-params', paramsLiensUtiles);

		// 	});


		// }

		// PAGE JEUNES
		// if (pageType === 'Jeunes') {

		// 	let aboType = document.querySelector('.Abo__fiche-headblock .headblock-subtitle');
		// 	if (aboType) {
		// 		aboType = aboType.innerText;
		// 		aboType = aboType.split(' ').join('_');
		// 	}


		// 	// LIENS UTILES
		// 	let liensUtilesArr = Array.from(document.querySelectorAll('a[data-track-key="aboFicheLiensUtiles"]'));

		// 	liensUtilesArr.forEach( lien => {

		// 		let paramsLiensUtiles = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "nomAbo",
		// 							"value": "${aboType}"
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "buttonName",
		// 							"value": "${lien.getAttribute('id')}"
		// 						}
		// 					]
		// 			}
		// 		]`;

		// 		// to get a line in the DOM instead of a templated string
		// 		paramsLiensUtiles = JSON.stringify(JSON.parse(paramsLiensUtiles));
		// 		lien.setAttribute('data-track-params', paramsLiensUtiles);

		// 	});

		// }

		// TRANSVERSE
		// Pour les slides des carousels, les data-track-key et data-track-params sont donnés dans le templating
		// unfortunatly, nous devons quand même faire un passage en js pour les multiCarousels
		// let slides = Array.from(document.querySelectorAll('.ShowsPanel-container.multi a[data-track-key="aboFicheCarouselSlide"]'));
		// let aboType = document.querySelector('.Abo__fiche-headblock .headblock-subtitle');
		// 	if (aboType) {
		// 		aboType = aboType.innerText;
		// 		aboType = aboType.split(' ').join('_');
		// 	}

		// slides.forEach( slide => {
		// 	let paramsSlide = `
		// 		[
		// 			{
		// 				"keyObject": "eventCategory",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "nomAbo",
		// 							"value": "${aboType}"
		// 						}
		// 					]
		// 			},
		// 			{
		// 				"keyObject": "eventLabel",
		// 				"params":
		// 					[
		// 						{
		// 							"key": "show",
		// 							"value": "${slide.querySelector('.ShowsPanel__performance-name').innerText}"
		// 						}
		// 					]
		// 			}
		// 		]`;
		// });
	// }
};

export default subscriptions;
