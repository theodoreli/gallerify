Gallerify
====================

Barebones animated picture galleries
--------------------------------------------

see http://gallerify-thead.rhcloud.com/ for live and moving example!

Just pure Javascript (no libraries/frameworks), CSS and HTML.

Goals of this project are

* cross browser support (Desktop: Works on IE8, FF, and Chrome. Mobile: is to be tested)
* no reliance on external libraries
* responsiveness
* visually appealing transitions/animations
* modularity

To get the slider working:
----------------------------------

html

    <div id="main-car">
        <div id="main-car-nav-prev-arrow" class="main-car-nav-stage-arrow">
        </div>
        <div id="main-car-nav-next-arrow" class="main-car-nav-stage-arrow">
        </div>
        <div id="main-car-stage">
            <img src="img/ferrari1.jpg"/>
            <img src="img/ferrari2.jpg"/>
            <img src="img/ferrari3.jpg"/>
        </div>
    </div>

js (along with including gallerify.js)

    var gal1 = new Gallery();

    gal1.buildSlider("main-car-nav-prev-arrow", "main-car-nav-next-arrow", "main-car-stage");

css

    body {
        max-width: 960px;
        margin: auto;
    }
    #main-car {
        position: relative;
        clear: both;
        padding-bottom: 66.18%;
        /* derived from image height/width of 634/958px ratio of the pics I used */
    }

    .main-car-nav-stage-arrow {
        z-index: 10;
        height: 40px;
        width: 40px;
        position: absolute;
        margin: auto;
        top:0;
        bottom:0;
    }
    #main-car-nav-prev-arrow {
        background: white url("../img/left-arrow.png") no-repeat center;
        left: 0; 
    }

    #main-car-nav-next-arrow {
        background: white url("../img/right-arrow.png") no-repeat center;
        right: 0;
    }
    #main-car-stage > img {
        position: absolute;
        max-width: 100%;
    }

To get the projector working:
----------------------------------

html

    <div id="second-gallery-wrapper">
        <div id="second-gallery-stage">
            <img src="img/ferrari1.jpg"/>
            <img src="img/ferrari2.jpg"/>
            <img src="img/ferrari3.jpg"/>
        </div>
        <div id="second-gallery-nav">
            <img src="img/ferrari1.jpg"/>
            <img src="img/ferrari2.jpg"/>
            <img src="img/ferrari3.jpg"/>
        </div>
    </div>

js *note that a single Gallery instance can have both a projector and a slider

    var gal1 = new Gallery();
    gal1.buildProjector("second-gallery-stage", "second-gallery-nav", true);

css

    #second-gallery-wrapper {
        max-width: 554px;
        left: 0;
        right: 0;
        margin: auto;
    }

    #second-gallery-stage {
        position: relative;
        padding-bottom: 66.18%;
    }

    #second-gallery-nav {
        text-align: center;
    }

    #second-gallery-nav > img {
        width: 100px;
        height: 100px;
    }
    .projected {
        position: absolute;
        max-width: 100%;
    }

How it works:
--------------

1. Content injecting into Gallery
    * For the sake of modularity, gallery content is injected via HTML directly. So this is great for templating engines. 
    * For the projector: as seen in the live example, any HTML element can be projected (as I did with text for this live site)

2. The CSS
    * Responsiveness is a must. Mobile!!!
    * For the slider: Arrows on both sides are centered vertically. See http://coding.smashingmagazine.com/2013/08/09/absolute-horizontal-vertical-centering-css for the magic
    > Question: Giving "position: absolute" to images will take these images out of flow with the page. And worst of all, we lose its height to be imprinted on the page. How do we get around this?
    * Answer: If our images to be injected have predefined dimensions, we have a solution. On the img's parent container (we call it a stage) we give it a padding-bottom formula. http://andmag.se/2012/10/responsive-images-how-to-prevent-reflow explains that "since the height of the div is calculated based on width on the parent div" we can take the current max-width value somewhere on a parental node. We use the image's width to height ratio as the % value for the padding-bottom. [I would have implemented this automatically, but so far I cannot find an IE8 compatible solution for CSS property/value setting]

3. The Javascript (I love you javascript...)
    * I've tried to put in some OO goodness into this. Each Gallery created can have up to one of each type of gallery animation
    * There are only two methods to possibly call: buildProjector() and buildSlider()
    * Parameters for both build functions are all DOM ID tags!


TODOS
--------------

* better interface for defining rates of transition
* better modularity (improved object oriented structure? extract animation algorithm into an engine?)
* further IE8+ compatible image transitions

Any feedback is welcomed and appreciated! (woo! this is my first github repo uploaded)

Again, see http://gallerify-thead.rhcloud.com/ for live and moving example! :)