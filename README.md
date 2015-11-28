gitbook-plugin-regexplace
==========
General text replacement (RegExp -style) plugin for GitBook projects.

RegExp guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

Usage example
-----

Mark partitions on the page that should not break apart on printing the page or generating the page as a pdf.

Add the ```regexplace``` plugin on the plugins array of your ```book.json``` file and configure appropriate substitutes and texts to replace:

```json
{
	"plugins": ["regexplace"],
	"pluginsConfig": {
		"regexplace": {
			"substitutes": [
				{"pattern": "<!-- nopb -->", "flags": "g", "substitute": "<div class=\"nopb\">"},
				{"pattern": "<!-- endnopb -->", "flags": "g", "substitute": "</div>"}
			]
		}
	}
}
```

Mark page partitions to text (markdown) files:

```markdown
<!-- nopb -->
# Title

Normal content...

> additional text blocks

<!-- endnopb -->
```

This will produce:

```html
<div class="nopb">
<h1>Title</h1>
<p>Normal content...</p>
<quote>additional text blocks</quote>
</div>
```

When above configuration is combined with the following website.css code block, it should prevent page breaks inside partitions, which are defined with div elements having a class ```nopb```:

```css
div.nopb {
	display: table;
    page-break-inside: avoid;	
}
```

Of course this also requires setting some style definitions for website and pdf generation on ```book.json``` similar to:

```json
"styles": {
    "website": "media/website.css"
    "pdf": "media/website.css"
}
```

Other examples
-----

Many other usages can be found for the plugin, because using html code blocks directly on markdown pages often ruins rendering the page. To solve the problem, you have to set comment blocks as described above markdown. Then you can change them to html with substitutes defined on plugin configuration.
