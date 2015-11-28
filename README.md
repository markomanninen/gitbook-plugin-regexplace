regexplace
==========
General text replacement (RegExp -style) plugin for GitBook projects.

RegExp guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

Usage example
-----

Mark partition on the page that should not break on printing the page or generating the page as a pdf.

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

Mark page partitions to text files:

```markdown
<!-- nopb -->
Normal content...
<!-- endnopb -->
```

This will produce:

```html
<div class="nopb">
Normal content...
</div>
```

While above configuration is combined with the following website.css code block, it should prevent page breaks inside partition:

```css
div.nopb {
	display: table;
    page-break-inside: avoid;	
}
```

Of course this also requires setting same style for website and pdf generation on ```book.json```:

```json
"styles": {
    "website": "media/website.css"
    "pdf": "media/website.css"
}
```

Many other usages can be found for the plugin, because using html code blocks directly on markdown pages ruins rendering the page. You can set different style comment blocks and change them to html with substitutes defined on plugin configuration.
