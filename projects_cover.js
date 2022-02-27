import __rafDebounce from 'onp:helpers/rafDebounce';
import __settings from 'onp:helpers/settings';
import {gsap} from 'gsap';
// import {debounce} from 'lodash';
import __debounce from 'onp:helpers/debounce';

// necessary CSS is imported from frontend/global/styles/templates/my_engaged_opera/index.scss
// import 'onp:components/landing-cover';
// import 'onp:components/projects-cover';

/*
	blade templates using this behavior:
	-> views\components\landing-cover.blade.php (http://operadeparis.local/mon-opera-engage)
	-> views\components\project-cover.blade.php (http://operadeparis.local/mon-opera-engage/)
 */

const projectsCover = ($el) => {
	const IS_LANDING_TEMPLATE = document.body.getAttribute('data-is-landing-template') !== null;
	
	let pageMode        = __settings.get('isMinDesktop') ? 'desktop' : 'mobile';
	let $mainNav        = document.getElementById('component-main-navigation');
	let $picture        = document.getElementById('component-cover-media');
	let $backLink       = $el.querySelector('.component-project-cover__backlink');
	let $videoContainer = $el.querySelector('.video-wrapper');
	
	let $video;
	let videoSources;
	let $sourceMobile;
	let $sourceDesktop;

	init();

	function init() {
		fadeinContent();
		$picture && parallax(); // Picture mode
		initMatchMedia();
		$backLink && addBackLinkEvents(); // $backlink only exist if not on the landing template
		$videoContainer && initVideoManager(); // Video mode
	}

	function addBackLinkEvents() {
		placeBacklink();

		document.addEventListener('smart_banner:destroyed', placeBacklink);
		document.addEventListener('smart_banner:created', placeBacklink);

		document.addEventListener('main_navigation:infobar:visible', placeBacklink);
		document.addEventListener('main_navigation:infobar:destroyed', placeBacklink);
		
		document.addEventListener('main_navigation:notifications:created', placeBacklink);
		document.addEventListener('main_navigation:notifications:destroyed', placeBacklink);

		window.addEventListener('resize', __debounce(placeBacklink, 500));
	}

	function placeBacklink() {
		let delta;

		if (pageMode === 'desktop') {
			delta = ONP.settings.get('mainNavigationHeight') + ONP.settings.get('notificationBarsHeights').desktop;
		} else {
			delta = ONP.settings.get('notificationBarsHeights').mobile + 50;
		}

		$backLink.style.setProperty('top', `${delta}px`);
	}

	function fadeinContent() {
	    const timeline = gsap.timeline({
	        defaults: {
	            duration: 2,
	            ease: 'power1.out'
	        }
	    });
	    
		const $titleExpand               = document.querySelector('.component-project-cover__texts-wrapper');
		const $navigatorElem             = document.querySelector('.component-project-cover__navigator');
		const $titleExpandLanding        = document.querySelector('.component-landing-cover__texts-wrapper');
		const $titleExpandLandingNomedia = document.querySelector('.component-landing-cover-nomedia__texts-wrapper');
		const $sectionEngaged            = document.querySelector('.section-engaged-opera__container');
		const $backlink                  = document.querySelector('.component-backlink-container');
		const $projectInformation        = document.querySelector('.section-page-informations');

		gsap.set($mainNav, {opacity: 0});

		timeline.to($mainNav, {opacity:1}, '=0.5');
		$titleExpand && timeline.to($titleExpand, {opacity:1}, '-=1.5');
		$titleExpandLanding && timeline.to($titleExpandLanding, {opacity:1}, '-=2.5');
		$titleExpandLandingNomedia && timeline.to($titleExpandLandingNomedia, {opacity:1}, '-=2.5');
		$sectionEngaged && timeline.to($sectionEngaged, {opacity:1}, '-=1.5');
		$navigatorElem && timeline.to($navigatorElem, {duration: 1, opacity:1}, '-=2.5');
		$backlink && timeline.to($navigatorElem, {duration: 1, opacity:1}, '<');
		$projectInformation && timeline.to($projectInformation, {duration: 1, opacity:1}, '-=2.5');
	}

	function parallax() {
		const scrollHandler = __rafDebounce(function() {
			$picture.style.setProperty('--scroll-percent', Math.min(1, window.scrollY / 750));
		});

		window.addEventListener('scroll', scrollHandler);

		// initial anim
		$picture.style.removeProperty('transform');
		$picture.classList.add('start');
	}

	// Determine the size to choose the perfect rez
	function initMatchMedia() {
		const mql = window.matchMedia("(min-width: 1024px)");

		pageMode = mql.matches ? 'desktop' : 'mobile';

		mql.addListener((e) => {
			pageMode = e.matches ? 'desktop' : 'mobile';

			if ($videoContainer) {
				videoSourceSwitcher();
			}
			placeBacklink()
		});
	}

	// Create the video
	function initVideoManager() {
		$video         = $el.querySelector('video');
		videoSources   = [...$video.children];
		
		$sourceMobile  = videoSources.filter(src => src.classList.contains('video-mobile'))[0];
		$sourceDesktop = videoSources.filter(src => src.classList.contains('video-desktop'))[0];

		$video.addEventListener('canplaythrough', function canplaythroughhandler({ target }) {
			target.play();
		});

		videoSourceSwitcher();
	}

	// Switch src for different rez
	function switchToVideoDesktop() {
		$video.setAttribute('poster', $video.getAttribute('data-poster-desktop'));
		$sourceMobile.removeAttribute('src');
		$sourceDesktop.setAttribute('src', $sourceDesktop.getAttribute('data-src'));
	}

	function switchToVideoMobile() {
		$video.setAttribute('poster', $video.getAttribute('data-poster-mobile'));
		$sourceDesktop.removeAttribute('src');
		$sourceMobile.setAttribute('src', $sourceMobile.getAttribute('data-src'));
	}

	function videoSourceSwitcher() {
		if (pageMode === 'desktop') {
			switchToVideoDesktop($sourceDesktop);
		} else if (pageMode === 'mobile' && $sourceMobile) {
			switchToVideoMobile($sourceMobile);
		}

		$video.load();
	}
};

export default projectsCover;
