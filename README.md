gitbook-plugin-regexplace
==========
General text replacement (RegExp -style) plugin for GitBook projects.

Note: version 2.0.0 and greater works only with GitBook 3!

Initial problems: 

- Using html code blocks directly on markdown pages often ruins rendering a GitBook page
- Similar type of content manipulation requires multiple plugins
- Indexing a book content

```gitbook-plugin-regexplace``` is to resolve these problems with tech-savvy approach: using js regular expressions and replace functionality plus giving option to add mathes on book variables.

RegExp guide: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

RexExr v2.0 builder: [http://regexr.com](http://regexr.com)

Usage examples
-----

* Prevent page break on PDF/print
* Adding a container for image
* Counting and listing unique words on a book
* Using citations/footnotes
* Data generation and lookup (thanks to [Dario Domizioli](https://github.com/hhexo) for contribution!)

> If you have new helpful use cases that could benefit plugin users, please send me a note so I can add new examples on this readme file: https://github.com/markomanninen/gitbook-plugin-regexplace


Prevent page break
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
    page-break-inside: avoid;	
}
```

Of course this also requires setting some style definitions for website and pdf generation on ```book.json``` similar to:

```json
"styles": {
    "website": "media/website.css",
    "pdf": "media/website.css"
}
```


Adding a container for image
-----

Next example is written with a help of RexExr v2.0 builder: [http://regexr.com/3caon](http://regexr.com/3caon) and inspired from the [image-caption](https://github.com/todvora/gitbook-plugin-image-captions) plugin of [@todvora](https://github.com/todvora).

```json
{
	"plugins": ["regexplace"],
	"pluginsConfig": {
		"regexplace": {
			"substitutes": [
				{
                   "pattern": "<img (.*)alt=\"([^\"]*)\"(.*) {0,1}\/{0,1}> {0,}{caption([^\\}]*)}", 
                   "flags": "g", 
                   "substitute": "<figure id=\"fig_PAGE_LEVEL_._INDEX_\"><img $1alt=\"$2\" $4$3><figcaption><span>Picture _PAGE_LEVEL_._INDEX_: </span>$2</figcaption></figure>"
                }
			]
		}
	}
}
```

This example also leverages ```_PAGE_LEVEL_``` and ```_INDEX_ ```templates which are replaced by page level information for ```_PAGE_LEVEL_``` and match index value for ```_INDEX_``` in the ```gitbook-plugin-regexplace``` plugin.

Lets assume ```page.md``` has a level 1 and there is content something like this:

```markdown
![Image 1](image.png){caption width=300}

![Image 2](image2.png){caption}
```

By using above regex substitutes it will produce output:

```html
<figure id="fig1.1"><img scr="image.png" alt="Image 1" width=300><figcaption><span>Picture 1.1: </span>Image 1</figcaption></figure>

<figure id="fig1.2"><img scr="image2.png" alt="Image 2"><figcaption><span>Picture 1.2: </span>Image 2</figcaption></figure>
```

Which in turn can be styled with ```website.css``` to get nice image caption and container:

```css
figure {
    margin: 1.5em 0px;
    padding: 10px 0;
    text-align: center;
}

figcaption {
    clear: left;
    margin: 0.75em 0px;
    text-align: center;
    font-style: italic;
    line-height: 1.5em;
    font-size: 80%;
    color: #666;
}
```

Screenshot from my [GitBook project](https://markomanninen.gitbooks.io/artifacts-of-the-flower-of-life/content/cownose.html) shown below:

![Image container](https://github.com/markomanninen/gitbook-plugin-regexplace/raw/master/image-container.png)


Counting and listing unique words on book
-----

Good way to do spell checking and text analysis is to count words on document and list them on test page. This can be achieved by regular expressions as well. First define configuration on ```book.json```:

```json
{
	"plugins": ["regexplace"],
	"pluginsConfig": {
		"regexplace": {
			"substitutes": [
				{
                    "pattern": "((?!([^<]+)?>)([0-9A-Za-z\\u0080-\\u00FF'.-]?)+(?!([^{]+)?})([0-9A-Za-z\\u0080-\\u00FF'])?(?!([^&]+)?;)([0-9A-Za-z\\u0080-\\u00FF']))",
                    "flags": "g",
                    "substitute": "$1",
                    "unreset": true,
                    "store": {
                        "substitute": "{$1}",
                        "unique": true,
                        "lower": true,
                        "variable_name": "words"
                    }
                }
			]
		}
	}
}
```

By using _PAGE_PATH_ on store substitute we can get information on which page word is used, for example:

```json
"substitute": "{_PAGE_PATH_#$1}"
```

But for now we just want to list all unique words in lower case and sorted alphabetically. Next step is to output words on any page you wish, say ```keywords.md```:


```markdown
# Words

Unique words in the book: {{ book.words.length }}

<hr/>

{{ book.words.sort().join(', ') }}
```

There you must be careful on printing words on the page, because they might also get counted on the final result. I have used output format ```{$1}``` for stored words and discounted them on pattern configuration: ```"pattern": "... (?!([^{]+)?}) ..."```. Also pattern ```"substitute": "$1"``` is important because you could easily replace all words on the book by this method. Here we recover match to the same position with ```$1```.


Using citations
-----

Again a specific pattern must be included on plugin configuration on ```book.json``` file:

```json
{
    "pattern": "<!-- cite author=\"(.*?)\" title=\"(.*?)\" date=\"(.*?)\" location=\"(.*?)\" type=\"(.*?)\"(.*?) -->",
    "flags": "g",
    "substitute": "<sup><a id=\"cite_INDEX_\" href=\"references.html#ref_PAGE_LEVEL_._INDEX_\" title=\"$1: $2 $3\" type=\"$5\">_INDEX_</a></sup>",
    "store": {
        "substitute": "<span><a id=\"ref_PAGE_LEVEL_._INDEX_\" href=\"_PAGE_PATH_#cite_INDEX_\">_PAGE_LEVEL_._INDEX_.</a></span> <span>$1:</span> <span><a$6>$2</a></span> <span>$3</span> <span>$4</span>",
        "variable_name": "citations"
    }
}
```

This will find next text blocks from markdown pages, for example ```reflections.md```:

```markdown
<!-- cite author="wikipedia.org" title="Vesica Piscis" date="" location="" type="website" href="http://en.wikipedia.org/wiki/Vesica_piscis" -->
```

and replace it with html block:

```html
<sup><a id="cite1" href="references.html#ref1.1" title="wikipedia.org: Vesica Piscis " type="website">1</a></sup>
```

which is a footnote link with autoincrement index per chapter.

On page for example ```references.md```, you can use this code snippet to list all citations used on a book:

```markdown
## Citations
<ul>
{% for cite in book.citations %}<li>{{ cite }}</li>{% endfor %}
</ul>
{% endif %}
```

Which will yield html:

```html
<h2>Citations</h2>
<ul>
<li><span><a id="ref1.1" href="reflections.html#cite1">1.1.</a></span> <span>wikipedia.org:</span> <span><a href="http://en.wikipedia.org/wiki/Vesica_piscis" target="_blank">Vesica Piscis</a></span> <span></span> <span></span></li>
</ul>
```

The first link ```1.1.``` is a reference back to the citation place.

If you want to list citations as footnotes at the end of each page/chapter, you could do separate include file, for example footnotes.md with the following code:

```markdown
<ul>
{% for cite in book.citations %}
{% if cite.match(file.path) %}<li>{{ cite }}</li>{% endif %}
{% endfor %}
</ul>
{% endif %}
```

Then you can add that file on every page you want to support footnotes, presumely at the end of the file:

```markdown
{% include 'footnotes.md' %}
```

One more small visual thing is to add these declarations to a stylesheet file, ```website.css```:

```css
sup {
    padding: 2px
}
ul.citations {
    margin-left: -30px;
}
ul.citations li:nth-child(1) {
    padding-top: 20px;
    border-top: 1px solid #BBB;
}
ul.citations li {
    font-size: 80%;
    list-style: outside none none;
}
```

Screenshot of output:

![Footnotes](https://github.com/markomanninen/gitbook-plugin-regexplace/raw/master/footnotes.png)

With ```gitbook-plugin-regexplace``` configuration patterns, substitutes, markdown templates and stylesheet you can manage a pretty detailed citation/footnote system on a GitBook project.


Data generation and lookup
-----

Gitbook offers the possibility of using variables in ```book.json``` so that data can be dynamically looked up in Markdown files. As a silly example, a variable can be used to hold the name of a character in a story, so that every time the author changes their mind about the name it can be replaced in just one place.

However, variables can be much more powerful than that. A map variable can hold a lot of data that could be looked up at different points in the book, using unique keys as indices. This would be really useful, if it wasn't for the fact that if you have a lot of data your ```book.json``` becomes very large.

Ideally, you would like to list your data items in a separate file, or maybe more than one file. Because ```gitbook-plugin-regexplace``` allows you to store regular expression matches in a variable, you can construct your map from data contained in Markdown files. All you need to do is to have a ```key``` parameter in the ```store``` section, and instead of storing the data in an array the plugin will treat the variable as a map, using the ```key``` to index it.

For example, let's consider an alternative way of doing citations. We are going to define all our citations in a Markdown file, which will be compiled with the full data for the citations; we will then use a dynamically created variable in other Markdown files to create the links to the citations.

Here is the pattern in ```book.json```:

```json
{
    "pattern": "<!-- define_citation code=\"(.*?)\" author=\"(.*?)\" title=\"(.*?)\" date=\"(.*?)\" location=\"(.*?)\" type=\"(.*?)\"(.*?) -->",
    "flags": "g",
    "substitute": "<span><a id=\"ref_$1\">$1</a></span> <span>$2:</span> <span><a$7>$3</a></span> <span>$4</span> <span>$5</span>",
    "store": {
        "key": "$1",
        "substitute": "<sup><a id=\"cite_$1\" href=\"references.html#ref_$1\" title=\"$2: $3 $4\" type=\"$6\">$1</a></sup>",
        "variable_name": "citations"
    }
}
```

Note the ```code=``` attribute in the HTML comment. This will be used as the map key because of the ```key: "$1"``` property of the ```store``` section. Also note that, contrary to the previous use case, we are now substituting the full definition of the citation, and storing the link to it.

We then define all our citations in ```references.md``` like this:

```markdown
<!-- define_citation code="cit1" author="wikipedia.org" title="Vesica Piscis" date="" location="" type="website" href="http://en.wikipedia.org/wiki/Vesica_piscis" -->

<!-- define_citation code="cit2" author="wikipedia.org" title="Venn Diagram" date="" location="" type="website" href="https://en.wikipedia.org/wiki/Venn_diagram" -->
```

The plugin will dynamically create the citations map as the ```book.citations``` variable. We can then index it in markdown pages, for example ```reflections.md```:

```markdown
The so-called "vescica piscis" {{book.citations["cit1"]}} can be seen as a part of a Venn diagram {{book.citations["cit2"]}} ...
```

The links and the citation text can then be styled through ```css``` in a way similar to the previous example.
