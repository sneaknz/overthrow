# Overthrow plugin

A jQuery plugin to open a very simple modal using content from within the page or loaded via ajax. See an example at <a href="http://code.sneak.co.nz/padme/">http://code.sneak.co.nz/overthrow/</a>.

## Usage

For any link that you want to open in an overthrow layer, set the <code>href</code> attribute to be the content you wish to load and then call <code>.overthrow()</code> for it. This plugin is only simple, and is set up to accept hrefs that are either a class/id which reference HTML elements within the current page (e.g. '<code>#content</code>' or '<code>.content</code>', for which the overthrow will load the contents of this element) or else an external fragment of HTML specified by a URL (e.g. <code>http://mysite.com/content.html</code>).

	<a href="#content">Open my inline content</a>
	<a href="http://mysite.com/content.html">Open my external content</a>

And the javascript to call the plugin:

	$('a').overthrow();

You can optionally pass in some settings via options when calling <code>overthrow()</code>, or for the <code>customClass</code> option you can optionally use a data attribute on the link.

	$('a').overthrow({
		customClass: 'myclass',
		afterLoad: function(){
			alert('hello!');
		},
		disableForTouch: true,
		duration: 300
	});

**Note:** The show & hide transitions use CSS and corresponding javascript delays to match, so edit at your own peril. If you change or remove the CSS transitions, be sure to poke around and update the javascript also.

## Options

<table>
 	<tr>
		<th align="left" valign="top">customClass</th>
		<td>A class that will be added to the overthrow wrapper. This can be specified in the settings object, or else as a data attribute on the link with the name <code>data-overthrow-class</code></td>
	</tr>
	<tr>
		<th align="left" valign="top">afterLoad</th>
		<td>A callback that gets called once the content is added to the overthrow. This is useful if you need to run any javascript against the content before displaying it.</td>
	</tr>
	<tr>
		<th align="left" valign="top">disableForTouch</th>
		<td>Boolean, defaults to <code>false</code>. When set to <code>true</code>, Overthrow is disabled when on a touch device.</td>
	</tr>
	<tr>
		<th align="left" valign="top">duration</th>
		<td>The duration (ms) of the animation transition in/out. Defaults to <code>200</code>. Note that transitions only get applied if the browser supports CSS transitions, and the transitions are controlled by the addition/removal of CSS classes.</td>
	</tr>
</table>

## To-do

- Add loading indicator while ajax content is retrieved
