var BLANK_PAGE_URL = '/public/blank.html';
var slideshow = remark.create({
    sourceUrl: '/public/sqcr-demo/md/generative-hip-hop-slides.md',
    highlightStyle: 'monokai',
    touch: false,
});

slideshow.on('showSlide', function(slide) {
    const {
        properties = { iframeURL: null, iframeSelector: null },
        properties: { iframeURL, iframeSelector },
    } = slide;

    if (iframeSelector) {
        const el = document.querySelector(iframeSelector);
        if (el) {
            el.src = iframeURL;
        }
    }
    // Slide is the slide being navigated to
});

slideshow.on('hideSlide', function(slide) {
    // Blank out all iframes
    const iframes = document.querySelectorAll('iframe');
    Array.from(iframes).forEach(el => {
        el.src = BLANK_PAGE_URL;
    });
});
