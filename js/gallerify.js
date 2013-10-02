function Gallery() {

}

// @stage: DOM element containing images which are to be used for gallery
Gallery.prototype.buildSlider = function(lArrow, rArrow, stage) {
    var mainCarLeftArrow = document.getElementById(lArrow),
        mainCarRightArrow = document.getElementById(rArrow),
        arrayDOMCache = [],
        mainCarStage = document.getElementById(stage),
        intIndexCurrentImg = 0,
        itrClipParam,
        imgToSlide;

    arrayDOMCache = initGalleryCache(mainCarStage, function(array, itr, stageChildren) {
        switch (itr) { // current displayed image has zindex of 2. neighbors (even at tailend) are 1
        case 0:
            array[itr].style.zIndex = 2;
            break;
        case 1:
            array[itr].style.zIndex = 1;
            break;
        case (stageChildren.length -1): //so that we sandwich the first image. tail end with zIndex++
            array[itr].style.zIndex = 1;
            break;
        default:
            array[itr].style.zIndex = 0;
        }
    });

    clickEvent(mainCarRightArrow, function() {
        // this guard ensures user cannot click while animation is still undergoing
        if (mainCarStage.getAttribute("data-animating") === "true") {
            return;
        } else {
            mainCarStage.setAttribute("data-animating", "true");
        }
        slide("right");
    });

    clickEvent(mainCarLeftArrow, function() {
        if (mainCarStage.getAttribute("data-animating") === "true") {
            return;
        } else {
            mainCarStage.setAttribute("data-animating", "true");
        }
        slide("left");
    });

    /*
    Transition is just having CSS clip values modified at ~60fps
    --TODO: give nicer interface for changing clip rate (currently @ 50px/change)

    To ensure that in-transition images have their order preserved, we have a zIndex algorithm
    for 4 images at a time. All other images are just static at 0 for that transition context.

    Here is a representation of images using their respective zIndex's:
    0012100

    Clicking the 5th image, during the transition (and before it completes) animating we have:
    0001200

    Once animation is totally finished:
    0001210

    The sandwiching of the 2 with 1's is to ensure that the correct background image is preserved when we are about to fade
    to a direction. Therefore, this implementation is safe bi-directionally
    */
    function slide(direction) {
        var directionPositionMapping,
            stringInitialRectClip;

        switch (direction) {
        case "right":
            directionPositionMapping = 3;
            stringInitialRectClip = "rect(0px, 958px, 634px, 958px)";//TODO: needs to get height and width auto
            //now we need to decremnent the pic previous.
            setZIndexAtCarPos(false, intIndexCurrentImg -1);
            // upon touch, decrements pic that lies underneath
            setZIndexAtCarPos(false, intIndexCurrentImg);
            break;
        case "left":
            directionPositionMapping = 1;
            stringInitialRectClip = "rect(0px 0px 634px 0px)";
            setZIndexAtCarPos(false, intIndexCurrentImg +1);
            // upon touch, decrements pic that lies underneath
            setZIndexAtCarPos(false, intIndexCurrentImg);
            break;
        }

        (direction === "right") ? intIndexCurrentImg++: intIndexCurrentImg--;

        setZIndexAtCarPos(true, intIndexCurrentImg); // for image we want to slide in

        imgToSlide = arrayDOMCache[getImageArrayPosModulo(intIndexCurrentImg)];
        imgToSlide.style.clip = stringInitialRectClip;
        itrClipParam = getClipParam(imgToSlide.style.clip, directionPositionMapping);
        intervalTimer(directionPositionMapping, direction, 50);
    }

    // @increment: boolean
    function setZIndexAtCarPos(increment, pos) {
        var imageDOM = arrayDOMCache[getImageArrayPosModulo(pos)];

        increment ? imageDOM.style.zIndex++ : --imageDOM.style.zIndex;
    }

    function getImageArrayPosModulo(pos) {
        var imagePosModulo = pos % arrayDOMCache.length;
        imagePosModulo = (imagePosModulo < 0) ? arrayDOMCache.length + imagePosModulo : imagePosModulo;

        return imagePosModulo;
    }

    function intervalTimer(splitPos, dir, clipSize) {
        var cond;

        var intervalTimerRundown = setInterval(function() {
                itrClipParam = (dir === "right") ? parseInt(itrClipParam, 10) - clipSize: parseInt(itrClipParam, 10) + clipSize;
                imgToSlide.style.clip = getNewClip(imgToSlide.style.clip, splitPos, itrClipParam);

                cond = (dir === "right") ? (itrClipParam <= 0): (itrClipParam >= 958);// need to extract 960px param out
                if (cond) {
                    //increment the one ahead of current image pointer
                    dir === "right" ? setZIndexAtCarPos(true, intIndexCurrentImg +1): setZIndexAtCarPos(true, intIndexCurrentImg -1);
                    mainCarStage.setAttribute("data-animating", "false");
                    clearInterval(intervalTimerRundown);//exit
                }

            }, 16.67); // ~60fps 
    }

    /*
        *** CLIPPING FUCTINONS ***

        .style.clip returns differently across browsers:
        ie8: 22px,22px
        FF: 22px, 22px
        Chrome: 22px 22px
    */
    // helper fcn: returns an array of all clip positional values (including "px" string)
    function getArrayClipInnards(clip) {
        var substringed = clip.substring(5, clip.indexOf(")") ),
            toReturn;

        if (substringed.indexOf(", ") > -1 ) { // FF
            //means we have firefox
            toReturn = substringed.split(", ");
        } else { // chrome/ie8
            toReturn = substringed.replace(/\s/g, ",").split(","); //to make it compatible with ie8!!
        }

        return toReturn;
    }

    // get the clip value at specified position
    // @pos: counting from 0 to indicate which position of clipping value we want to return
    function getClipParam(clip, pos) {
        var extractedPosClipParam = getArrayClipInnards(clip)[pos];
        
        return extractedPosClipParam.substring(0, extractedPosClipParam.indexOf("px"));
    }

    // returns a css clip value with changed value at specified position
    function getNewClip(currentClip, pos, value) {
        var arrayClipInnards = getArrayClipInnards(currentClip),
            clipValueToBeReplaced = getClipParam(currentClip, pos);

        // change the current clip value to new value, while preserving "px" string
        arrayClipInnards[pos] = arrayClipInnards[pos].replace(clipValueToBeReplaced, value);

        return "rect(" + arrayClipInnards.join(" ") + ")";
    }

};

/*
zIndex Algorithm for fade animation: 
All images are set to 0 at the start, except for first image which is given 1:
1000

When new image is clicked, during the animation phase that image gets value of 2:
1200

When animation is complete:
0100

This is to ensure that the correct image remains in the background while we are animating.
(if we allow it to that is, via last boolean param @bgShow)
*/
Gallery.prototype.buildProjector = function(stage, nav, bgShow) {
    var secondGalleryStage = document.getElementById(stage),
        secondGalleryNav = document.getElementById(nav),
        arrayGalleryThumbDOMLookup = [],
        arrayGalleryDOMLookup = [],
        imageTracker = 0,
        isBgShow = bgShow; // image (derived from array position) that is current displayed on gallery

    arrayGalleryDOMLookup = initGalleryCache(secondGalleryStage, function(array, itr) {
        array[itr].className = "projected";
        array[itr].style.zIndex = 0;
        if (itr === 0) {
            array[itr].style.zIndex = 1;
        } else {
            setOpacity(array[itr], 0);
        }
    });
    arrayGalleryThumbDOMLookup = initGalleryCache(secondGalleryNav, function(array, itr) {
        array[itr].id = "thumb" + (itr + 1);
        clickHandler(array[itr]);
    });

    // @value; ie 1.0 for full opacity, 0.5 for half
    function setOpacity(element, value) {
        var ieValue = value * 100;

        element.style.opacity = value;
        // For the lovely IE8
        element.style.filter = "alpha(opacity=" +ieValue+ ")";
    }

    function clickHandler(element) {
        clickEvent(element, function() {
            var stringElementId = element.id,
                index = stringElementId.slice(stringElementId.lastIndexOf("thumb")-1, stringElementId.length);

            if (secondGalleryStage.getAttribute("data-animating") === "true") {
                return;
            }
            index--; // as image ID's start counting from 1, array starts from 0
            if (index === imageTracker) {
                return; // so that we cannot click on click on current element
            }
            secondGalleryStage.setAttribute("data-animating", "true");

            arrayGalleryDOMLookup[index].style.zIndex = 2; // zIndex 2 given to image clicked
            if (!isBgShow) {
                arrayGalleryDOMLookup[imageTracker].style.display = "none"; // so we just fade from white
            }

            //fade in current image
            fadeRunner(arrayGalleryDOMLookup[index], index);
        });
    }

    function fadeRunner(element, index) {
        var opac = 0.00;

        var fadeRunnerRundown = setInterval(function() {
            opac += 0.02;
            setOpacity(element, opac);
            if (opac >= 1) {
                if (!isBgShow) {
                    arrayGalleryDOMLookup[imageTracker].style.display = "inline";
                }
                arrayGalleryDOMLookup[imageTracker].style.zIndex = 0;
                arrayGalleryDOMLookup[index].style.zIndex = 1;
                setOpacity(arrayGalleryDOMLookup[imageTracker], 0); // set backgrounded image opac = 0
                imageTracker = index;
                secondGalleryStage.setAttribute("data-animating", "false");
                clearInterval(fadeRunnerRundown);
            }
        }, 16.67);
    }
};

function initGalleryCache(stage, initFunc) {
    var i,
        arrayCache = [],
        arrayStageChildrenImgs = stage.children;

    for (i = 0; i < arrayStageChildrenImgs.length; i++) {
        arrayCache[i] = arrayStageChildrenImgs[i]; // populate the cache
        initFunc(arrayCache, i, arrayStageChildrenImgs);
    }

    return arrayCache;
}

function clickEvent(el, callback) {
    if (el.addEventListener) {
        el.addEventListener("click", callback);
    } else if (el.attachEvent) {
        el.attachEvent("onclick", callback);
    } else {
        throw "Incompatible event handler";
    }
}

var gal1 = new Gallery();

gal1.buildSlider("main-car-nav-prev-arrow", "main-car-nav-next-arrow", "main-car-stage");
gal1.buildProjector("second-gallery-stage", "second-gallery-nav", true);

var secondGalText = new Gallery();
secondGalText.buildProjector("second-gallery-text-stage", "second-gallery-nav", false);