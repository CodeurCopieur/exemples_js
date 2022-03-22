// SCSS
// import 'onp:components/vertical-slider';

import Swiper from 'swiper';
import SwiperCore, {Pagination, Mousewheel} from 'swiper/core';
import {disableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import __scrollToY from 'onp:helpers/scroll_to_y';
import __settings from 'onp:helpers/settings';
import __closest from 'onp:helpers/closest';
// import __throttle from 'onp:helpers/throttle';
// import __debounce from 'onp:helpers/debounce';
import __youtubeIframeApiLoader from 'onp:helpers/youtubeIframeApiLoader';

import templateModalMedia from 'onp:global:js-templating/shows/modal/media';

SwiperCore.use([Pagination, Mousewheel]);
gsap.registerPlugin(ScrollToPlugin);

const verticalSlider = ($el) => {
	let verticalSliderInstance;

	// Assignements made via listening to the custom event
	// 'modal_gallery:sliders:created' dispatched from modal_gallery.js
	let modalMasterSliderInstance;
	let modalSlaveSliderInstance;
	let removeEventsAndResetModalGallery;

	let pageMode                   = __settings.get('isMinDesktop') ? 'desktop' : 'mobile';
	let $swiperContainer           = $el.querySelector('.swiper-container');
	let $swiperWrapper             = $el.querySelector('.swiper-wrapper'); // <ul> list containing the slides
	let $swiperPagination          = $swiperContainer.querySelector('.swiper-pagination');
	let $summarySticky             = document.getElementById('summary-sticky');
	let $pagination                = $el.querySelector('.component-vertical-slider__pagination');
	let $showsRevealer             = document.querySelector('.component-shows-revealer');
	let $mainContent               = document.getElementById('main-content');
	let $mandatorySlide            = $swiperContainer.querySelector('.component-vertical-slider__slide--mandatory');
	let $mandatoryVideoContainer   = $mandatorySlide.querySelector('.component-vertical-slider__video-container');
	let $mandatoryPictureContainer = $mandatorySlide.querySelector('.component-vertical-slider__picture-container');
	let $mandatoryTexts            = $mandatorySlide.querySelector('.component-vertical-slider__texts-container');
	let $mandatoryCredits          = $mandatorySlide.querySelector('.component-image-credit-revealer');
	let $mainNavigation            = document.getElementById('component-main-navigation');
	let $notifBarMobile            = document.querySelector('.component-main-navigation__notification.vanish-desktop'); 

	let $mandatoryVideo;
	let $mandatoryImage;
	let videoSources;
	let $sourceMobile;
	let $sourceDesktop;

	// Modal related. Created on the fly on user action.
	let $modalMedia;
	let $modalMediacloseButton;
	let $modalMediaBackground
	let $modalMediaIframeContainer;
	let $modalMediaGalleryContainer;
	let $loaderElem;

	let $currentSlide = $el.querySelector('.component-vertical-slider__slide');
	let slideslength  = $el.querySelectorAll('.component-vertical-slider__slide').length;
	
	let currentSlideActiveIndex = 0;
	let lang                    = document.documentElement.lang;

	let loadTimeline = gsap.timeline({
		defaults: {
			duration: .500
		}
	});

	loadTimeline.pause();
	window.ACTIVE_YOUTUBE_PLAYER = null;
	
	init();

	function init() {
		if (slideslength > 1) {
			initVerticalSlider();
			addCommonSwiperEvents();
			addPaginationTracking();
		} else {
			$el.classList.add('component-vertical-slider--disabled');
		}

		if ($mandatoryVideoContainer) {
			initVideoManager();
		}

		addEvents();
		initMatchMedia();
		generatePageLoadAnimation();
	}

	function generatePageLoadAnimation() {
		gsap.set($mainNavigation, {opacity: 0});
		$notifBarMobile && gsap.set($notifBarMobile, {opacity: 0});
		gsap.set($mandatoryTexts, {opacity: 0});

		([
			[$mandatoryTexts],
			[$mainContent],
			[$mainNavigation, '+=0.250'],
			[$notifBarMobile, '<'],
			[$mandatoryCredits]
		].forEach(([element, timing]) => {
			element && loadTimeline.to(element, {
				opacity: 1,
				onComplete: () => element.style.removeProperty('opacity')
			}, timing)
		}))
	}

	function setCurrentSlide(swiper) {
		$currentSlide = swiper.slides[swiper.activeIndex]
	}

	function initMatchMedia() {
		const mql = [
			{ rule: window.matchMedia("(max-width: 1023px)"), pageMode: 'mobile' },
			{ rule: window.matchMedia("(min-width: 1024px)"), pageMode: 'desktop' }
		];

		mql.forEach(mql => {
			if (mql.rule.matches) {
				pageMode = mql.pageMode;
			}

			mql.rule.addListener((e) => matchMediaChangeHandler(e, mql));
		});
	}

	function matchMediaChangeHandler(e, mql) {
		if (e.matches) {
			pageMode = mql.pageMode;
			$mandatoryVideoContainer && videoSourceSwitcher();
		}
	}

	function addEvents() {
		$swiperWrapper.addEventListener('click', swiperClickDispatcher);

		if (!__settings.get('isTouch')) {
			$el.addEventListener('mouseover', verticalSliderMouseOverHandler);
		}

		// custom event dispatched inside modal_gallery.js
		document.addEventListener('modal_gallery:sliders:created', function modalGallerySlidersCreated({detail}) {
			modalMasterSliderInstance        = detail.data.masterSlider;
			modalSlaveSliderInstance         = detail.data.slaveSlider;
			removeEventsAndResetModalGallery = detail.data.removeEventsAndReset
		});

		window.addEventListener('load', function loadAnimationHandler() {
			window.removeEventListener('load', loadAnimationHandler);
			loadTimeline.play();
		})
	}

	function addCommonSwiperEvents() {
		verticalSliderInstance.on('slideChangeTransitionEnd', slideChangeTransitionEndhandler);
		verticalSliderInstance.on('activeIndexChange', activeIndexChangeHandler);
		verticalSliderInstance.on('slideChange', slideChangeHandler);
		verticalSliderInstance.on('reachEnd', reachEndHandler);
	}

	function slideChangeTransitionEndhandler(swiper) {
		const {realIndex} = swiper;
		
		$mandatoryVideo && videoPlayingStateHandler(realIndex);
	}

	function activeIndexChangeHandler(swiper) {
		setCurrentSlide(swiper);
		currentSlideActiveIndex = swiper.activeIndex;
	}

	// https://github.com/nolimits4web/swiper/issues/3494	
	function slideChangeHandler(swiper) {
		setTimeout(function() {
			// console.log('slideChangeHandler() - releaseOnEdges IS FALSE');
		      swiper.params.mousewheel.releaseOnEdges = false;
		      swiper.params.touchReleaseOnEdges = false;
		  }, 300); //500
	}

	function reachEndHandler(swiper) {
		setTimeout(function() {
			// console.log('reachEndHandler() - releaseOnEdges IS TRUE');
		    swiper.params.mousewheel.releaseOnEdges = true;
		    swiper.params.touchReleaseOnEdges = true;
		    swiper.mousewheel.disable();
		}, 600); //750
	}

	function verticalSliderMouseOverHandler(e) {
		// console.log('verticalSliderMouseOverHandler: ', verticalSliderMouseOverHandler);
		if (window.pageYOffset === 0 && verticalSliderInstance) {
			verticalSliderInstance.mousewheel.enable();
			return;
		}

		gsap.to(window, {
			duration: .350,
			scrollTo: {y: 0},
			ease: 'power2',
			onComplete: function() {
				verticalSliderInstance && verticalSliderInstance.mousewheel.enable();
			}
		});
	}

	function initVerticalSlider() {
		verticalSliderInstance = new Swiper($swiperContainer, {
			resistance: true, // disable resistant bounds
			resistanceRatio: 0, //control resistance ratio
			slidesPerView: 1,
			spaceBetween: 0,
			direction: 'vertical',
			loop: false,
			grabCursor: true,
			pagination: {
				el: $swiperPagination,
				clickable: true
			},
			mousewheel: {
				eventsTarget: 'container',
				sensitivity: .01
			}
		});
	}

	//swiper.previousIndex
	//swiper.realIndex
	//swiper.activeIndex
	function initVideoManager() {
		$mandatoryVideo = $mandatoryVideoContainer.querySelector('video');
		videoSources    = [...$mandatoryVideo.children];
		
		$sourceMobile   = videoSources.filter(src => src.classList.contains('component-vertical-slider__src-mobile'))[0];
		$sourceDesktop  = videoSources.filter(src => src.classList.contains('component-vertical-slider__src-desktop'))[0];

		$mandatoryVideo.addEventListener('canplaythrough', function canplaythroughHandler({target}) {
			target.play();
		});
		
		// First switch now directly handled inside the blade template.
		// See: views\components\vertical-slider.blade.php

		// videoSourceSwitcher();
	}

	function videoSourceSwitcher() {
		if (pageMode === 'desktop') {
			switchToVideoDesktop($sourceDesktop);
		} else if (pageMode === 'mobile' && $sourceMobile) {
			switchToVideoMobile($sourceMobile);
		}

		$mandatoryVideo.load();
	}

	function switchToVideoDesktop() {
		$mandatoryVideo.setAttribute('poster', $mandatoryVideo.getAttribute('data-poster-desktop'));
		$sourceMobile.removeAttribute('src');
		$sourceDesktop.setAttribute('src', $sourceDesktop.getAttribute('data-src'));
	}

	function switchToVideoMobile() {
		$mandatoryVideo.setAttribute('poster', $mandatoryVideo.getAttribute('data-poster-mobile'));
		$sourceDesktop.removeAttribute('src');
		$sourceMobile.setAttribute('src', $sourceMobile.getAttribute('data-src'));
	}

	function videoPlayingStateHandler(realIndex) {
		$mandatoryVideo = $mandatoryVideoContainer.querySelector('video');

		if (realIndex === 0) {
			$mandatoryVideo.play();
		} else {
			pauseVideoAndRewind();
		}
	}

	function pauseVideoAndRewind() {
		$mandatoryVideo.pause();
		$mandatoryVideo.currentTime = 0;
	}

	function modalMediaClickDispatcher({target}) {
		// console.log('modalMediaClickDispatcher()', target);
		const closingAction = target.matches('.component-shows-modal-scene__close') 
		|| target.matches('.component-shows-modal-scene__background') 
		|| target.matches('.component-modal-gallery__slave-slider-slide');

		if (closingAction) {
			closeModalMedia({
				gallery: 	$modalMedia.matches('.modal-gallery'),
				audio: 		$modalMedia.matches('.modal-audio'),
				video: 		$modalMedia.matches('.modal-video'),
				youtube: 	$modalMedia.matches('.modal-video-youtube'),
				soundCloud: $modalMedia.matches('.modal-audio-soundcloud')
			})
		}
	}

	function swiperClickDispatcher({target}) {
		const action = target.getAttribute('data-action');

		if (!action) {
			return;
		}

		switch(action) {
			case 'scroll-to':
				scrollToElemManager(target);
				break;
			case 'open-media':
				buildModalMedia(target);
				break;
		}
	}

	function buildModalMedia(target) {
		const mediaType       = target.getAttribute('data-media-type');
		const mediaBrandAttr  = target.getAttribute('data-media-brand');
		const iframeEmbedAttr = target.getAttribute('data-iframe-embed');

		if (!mediaType) {
			console.warn('Missing "data-media-type" attribute on the trigger element.');
			return;
		}

		document.body.insertAdjacentHTML('afterbegin', templateModalMedia(mediaType, mediaBrandAttr, currentSlideActiveIndex));

		$modalMedia                 = document.getElementById('shows-modal-scene');
		$modalMediacloseButton      = $modalMedia.querySelector('.component-shows-modal-scene__close');
		$modalMediaBackground       = $modalMedia.querySelector('.component-shows-modal-scene__background');
		$modalMediaIframeContainer  = $modalMedia.querySelector('.component-shows-modal-scene__iframe-container');
		$modalMediaGalleryContainer = $modalMedia.querySelector('.component-shows-modal-scene__gallery-container');
		$loaderElem                 = $modalMedia.querySelector('.component-shows-modal-scene__loader-message');

		disableBodyScroll($modalMedia);

		$modalMedia.addEventListener('click', modalMediaClickDispatcher);

		const timeline = gsap.timeline({
			defaults: {
				duration: .500
			}
		});

		switch(true) {
			// Audio embed (always an iframe)
			// Video embed (iframe overload)
			case (mediaType === 'audio'):
			case (mediaType === 'video' && typeof iframeEmbedAttr === 'string'): {
				const $classicIframe = createClassicIframe(iframeEmbedAttr);

				asyncModalApparition(timeline, () => loadClassicIframe($classicIframe));

				break;
			}

			// Youtube Video (iframe API)
			case (mediaType === 'video' && iframeEmbedAttr === null): {
				const youtubeIds = {
					desktopId: target.getAttribute('data-youtube-id-desktop'),
					mobileId: target.getAttribute('data-youtube-id-mobile')
				};

				__youtubeIframeApiLoader()
					// At this point the api is loaded.
					.then(() => {
						asyncModalApparition(timeline, () => loadYoutubeIframe(youtubeIds));
					});

				break;
			}

			// Classic gallery
			case (mediaType === 'gallery'): {
				appendGalleryFromDomToModal(target);

				syncModalApparition(timeline);

				break;
			}

			default: {
				console.info(`buildModalMedia() - switch case -> default. mediaType: ${mediaType}`);
			}
		}
	}

	function asyncModalApparition(timeline, asyncCallback) {
		timeline
			.to($modalMedia, {
				opacity: 1,
				onComplete: function() {
					console.log('1) $modalMedia 100% visible');
				}
			})
			.then(asyncCallback)
			.then(({tl, ytPlayer}) => {
				console.log('2) then() block -> tl.play(): ', tl);
				// Ultimately using a setTimeout to handle hazardous iframe content apparition.
				// This is a pitty 😔 but...it ensures there is for example no white background
				// displayed before seeing a player (even if the iframe has finished loading).
				setTimeout(() => {
					tl.play();

					if (ytPlayer) {
						window.ACTIVE_YOUTUBE_PLAYER = ytPlayer;

						if (__settings.get('isiOS')) {
							ytPlayer.mute();
						}

						ytPlayer.playVideo();
					}
				}, 500);
			})
			.catch((error) => {
				console.error('asyncModalApparition error: ', error);

				const errorTimeline = gsap.timeline({defaults: {duration: .500}});
				const errorMessage  = lang === 'fr' ? 'Une erreur est survenue. Veuillez réessayer plus tard.' : 'An error occured. Please try again later.';
				
				errorTimeline
					.to($loaderElem, {
						opacity: 0,
						onComplete: () => {
							$loaderElem.classList.add('error');
							$loaderElem.innerHTML = `<span class="maz-icon-warning"></span>${errorMessage}`;
						}
					})
					.to($loaderElem, {
						opacity: 1
					})
					.add(() => closeModalMedia({error: true}), '>+4');
			})
	}

	function syncModalApparition(timeline) {
		timeline
			.to($modalMedia, {opacity: 1})
			.to($modalMediaGalleryContainer, {opacity: 1})
	}

	function createClassicIframe(iframeString) {;
		const doc = new DOMParser().parseFromString(iframeString, 'text/html');

		return doc.documentElement.querySelector('iframe');
	}

	function loadYoutubeIframe({
		desktopId,
		mobileId
	}) {
		const promise = new Promise((resolve, reject) => {
			if (!desktopId) {
				reject();
				return;
			}

			const playerReceiver = $modalMedia.querySelector('.component-shows-modal-scene__youtube-player');
			const player         = new YT.Player(playerReceiver, {
				playerVars: {
					modestbranding: true,
					fs: 1,
					rel: 0,
					playsinline: 1,
					autoplay: 1
				},
				height: '',
				width: '',
				videoId: pageMode === 'mobile' && mobileId ? mobileId : desktopId,
				events: {
					onReady: (event) => resolve({tl: generateIframeTimeline(), ytPlayer: event.target}),
					onError: reject
				}
			});
		});

		return promise;
	}

	function loadClassicIframe($classicIframe) {
		const promise = new Promise((resolve, reject) => {
			// Handle iframe loading success
			$classicIframe.addEventListener('load', function onLoad() {
				// console.log('classicIframe Loaded.');
				$classicIframe.removeEventListener('load', onLoad);
				resolve({tl: generateIframeTimeline()});
			});

			// Handle iframe loading error
			$classicIframe.addEventListener('error', function onError(e) {
				$classicIframe.removeEventListener('error', onError);
				console.error('loadClassicIframe error: ', e);
				reject();
			});

			// append the $classicIframe to the DOM and trigger the "load" or "error" event
			$modalMediaIframeContainer.appendChild($classicIframe);
		});

		return promise;
	}

	function generateIframeTimeline() {
		const timeline = gsap.timeline({
			paused: true,
			defaults: {
				duration: .500
			}
		});

		timeline
			.to($modalMediaIframeContainer, {
				opacity: 1,
				onComplete: function() {
					console.log('3) iframe 100% visible');
				}
			})
			.to($loaderElem, {
				opacity: 0,
				onComplete: function() {
					$loaderElem.parentNode.removeChild($loaderElem);
				}
			}, '<');

		return timeline;
	}

	function appendGalleryFromDomToModal(target) {
		console.log('appendGalleryFromDomToModal()');
		const $galleryStoredInSlide  = $currentSlide.querySelector('.component-modal-gallery'); //stored in the DOM as last slide children, with display: none;
		const $modalMediaSlaveSlider = $modalMedia.querySelector('.component-modal-gallery__slave-slider'); //created on the fly, when generating the $modalMedia
		const clonedPictures         = [...$galleryStoredInSlide.querySelectorAll('picture')].map(pic => pic.cloneNode(true));

		createSlaveSlides($modalMediaSlaveSlider, clonedPictures);

		// $galleryStoredInSlide.setAttribute('data-behavior', 'lazy_images_parser modal_gallery');
		$galleryStoredInSlide.setAttribute('data-behavior', 'modal_gallery');

		$modalMediaGalleryContainer.insertAdjacentElement('afterbegin', $galleryStoredInSlide);

		window.ONP.loadBehaviors($galleryStoredInSlide.parentNode);
	}

	function createSlaveSlides($modalMediaSlaveSlider, pictures) {
		pictures.map(picture => {
			const slide = document.createElement('div');
			
			slide.classList.add('component-modal-gallery__slave-slider-slide');
			slide.classList.add('swiper-slide');

			// Cleaning the picture sources and img from all logic related to the lazy_images_parser behavior
			// const lazyElems = [...picture.querySelectorAll('.lazyload-picture-js')];
			// cleanLazyElems(lazyElems);

			// Add the picture inside the slide
			slide.insertAdjacentElement('afterbegin', picture);

			// Add the slide inside the correct targetElement, after its last child.
			$modalMediaSlaveSlider.querySelector('.swiper-wrapper').insertAdjacentElement('beforeend', slide);
		})
	}

	function cleanLazyElems(lazyElems) {
		lazyElems.map(elem => {
			elem.removeAttribute('class');

			if (elem.matches('[data-srcset]')) {
				elem.setAttribute('srcset', elem.getAttribute('data-srcset'));
				elem.removeAttribute('data-srcset');
			} else {
				elem.setAttribute('src', elem.getAttribute('data-src'));
				elem.removeAttribute('data-src');
			}
		});
	}

	function scrollToElemManager(element) {
		let dataScrollToElem = element.getAttribute('data-target');
		let $scrollToElem    = document.querySelector(`[data-id=${dataScrollToElem}]`);

		let staticDelta        = 25;
		let scrollToElemHeight = $scrollToElem.getBoundingClientRect().height;
		let offsetValue;

		if (__settings.get('isMinDesktop')) {
			let summaryStickyHeight = $summarySticky.getBoundingClientRect().height;

			offsetValue = summaryStickyHeight + scrollToElemHeight;
		} else {
			let mainNavigationheight = __settings.get('mainNavigationHeight');
			offsetValue = mainNavigationheight + scrollToElemHeight;
		}
		
		gsap.to(window, {
			duration: 1,
			scrollTo: {
				y: $scrollToElem,
				offsetY: offsetValue + staticDelta
			},
			ease: 'power2'
		});
	}

	function closeModalMedia(from) {
		gsap.to($modalMedia, {
			duration: .500,
			opacity: 0,
			onStart: function() {
				$modalMedia.removeEventListener('click', closeModalMedia);
			},
			onComplete: function() {
				if (from.gallery) {
					const $galleryInsideModalMedia = $modalMediaGalleryContainer.querySelector('.component-modal-gallery');
					$currentSlide.insertAdjacentElement('beforeend', $galleryInsideModalMedia);

					// See: addEvents()
					modalMasterSliderInstance.destroy();
					modalSlaveSliderInstance.destroy();
					removeEventsAndResetModalGallery();
					modalMasterSliderInstance = null;
					modalSlaveSliderInstance  = null;
				} else if (from.youtube) {
					window.ACTIVE_YOUTUBE_PLAYER = null;
				}
				
				$modalMedia && $modalMedia.parentNode.removeChild($modalMedia);
				
				clearAllBodyScrollLocks();
			}
		});
	}

	function addPaginationTracking() {
		const bullets = [...$pagination.querySelectorAll('.swiper-pagination-bullet')];

		bullets.map((bullet, index) => {
			bullet.classList.add('gtmcarrouselposition');
			bullet.setAttribute('data-gtm-position', index + 1);
		})
	}
};

export default verticalSlider;