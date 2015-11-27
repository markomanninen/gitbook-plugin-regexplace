regexplace
==========
Common text replacement plugin for GitBook project.

Usage example
-----

Mark partition on page that should not break on printing a page or generating a page as a pdf.

Add the ```regexplace``` plugin on the plugins array of your book.json file and configure appropriate substitutes and texts to replace:

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

Mark page partitions to the text files:

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

Unlimited other usages can be found for the plugin.