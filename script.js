// Document Processor - Improved Version
(function() {
    'use strict';

    class DocumentProcessor {
        constructor() {
            this.jsonData = null;
            this.processedOutput = '';
            this.init();
        }

        async init() {
            try {
                await this.loadAbbreviations();
                this.setupEventListeners();
                console.log('DocumentProcessor initialized successfully');
            } catch (error) {
                console.error('Initialization failed:', error);
            }
        }

        async loadAbbreviations() {
            try {
                const response = await fetch('json/abbr.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                this.jsonData = await response.json();
                console.log('Abbreviations loaded successfully');
            } catch (error) {
                console.error('Failed to load abbreviations:', error);
                // Continue without abbreviations
                this.jsonData = [];
            }
        }

        setupEventListeners() {
            const fileInput = document.getElementById('document');
            const h2Button = document.getElementById('h2button');
            const copyButton = document.getElementById('copy-txt');

            if (fileInput) {
                fileInput.addEventListener('change', (event) => this.handleFileSelect(event));
            }

            if (h2Button) {
                h2Button.addEventListener('click', () => this.manualH2Processing());
            }

            if (copyButton) {
                copyButton.addEventListener('click', () => this.copyToClipboard());
            }
        }

        handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.readFileAsArrayBuffer(file)
                .then(arrayBuffer => {
                    if (typeof mammoth !== 'undefined') {
                        return mammoth.convertToHtml({ arrayBuffer });
                    } else {
                        throw new Error('Mammoth library not loaded');
                    }
                })
                .then(result => this.processDocument(result))
                .catch(error => console.error('File processing error:', error));
        }

        readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = () => reject(new Error('File reading failed'));
                reader.readAsArrayBuffer(file);
            });
        }

        processDocument(result) {
            let output = result.value;
            
            // Apply regex transformations
            output = this.applyRegexTransformations(output);
            
            // Apply abbreviations
            output = this.applyAbbreviations(output);
            
            // Auto-process H2s and "On this page" links
            output = this.autoProcessH2s(output);
            
            this.processedOutput = output;
            this.displayResult(output);
        }

        applyRegexTransformations(output) {
            const transformations = [
                {
                    regex: /.+?(?=<h1>)/g,
                    replacement: '',
                    description: 'Remove content above first h1'
                },
                {
                    regex: /(?!(<\/[a-z0-9]+>))(<)/g,
                    replacement: '\n<',
                    description: 'Add newlines before opening tags'
                },
                {
                    regex: /(\sid=".*")/g,
                    replacement: '',
                    description: 'Remove id attributes'
                },
                {
                    regex: /<([a-z0-9]+)>(\n+|)<\/\1>/gm,
                    replacement: '',
                    description: 'Remove empty tags',
                    iterations: 6
                },
                {
                    regex: /<table(.*?)>/gm,
                    replacement: '<table class="table table-bordered" style="table-layout: fixed;">',
                    description: 'Style table tags'
                },
                {
                    regex: /(?<=<table(.*?)>\n*?)(<tr>)/gm,
                    replacement: '<tr class="active">',
                    description: 'Style first table row'
                },
                {
                    regex: /<strong>(\s)?<\/strong>/g,
                    replacement: '',
                    description: 'Remove empty strong tags'
                },
                {
                    regex: /<p>(\s)?<\/p>/g,
                    replacement: '',
                    description: 'Remove empty paragraph tags'
                },
                {
                    regex: /<br(\s)?\/>/g,
                    replacement: '',
                    description: 'Remove break tags'
                },
                {
                    regex: /(<h2> )/g,
                    replacement: '<h2>',
                    description: 'Clean h2 opening tags',
                    iterations: 3
                },
                {
                    regex: /(\W<\/h2>)/g,
                    replacement: '</h2>',
                    description: 'Clean h2 closing tags'
                },
                {
                    regex: /(>)\n+(?=\w)/gm,
                    replacement: '>',
                    description: 'Remove newlines after tags'
                },
                {
                    regex: /<em> <\/em>/g,
                    replacement: '',
                    description: 'Remove empty em tags'
                }
            ];

            return transformations.reduce((currentOutput, transform) => {
                const iterations = transform.iterations || 1;
                let result = currentOutput;
                
                for (let i = 0; i < iterations; i++) {
                    result = result.replaceAll(transform.regex, transform.replacement);
                }
                
                return result;
            }, output);
        }

        applyAbbreviations(output) {
            if (!this.jsonData || !Array.isArray(this.jsonData)) return output;

            return this.jsonData.reduce((currentOutput, item) => {
                try {
                    if (!item.accronym || !item.tag) return currentOutput;
                    
                    const acronymRegex = new RegExp(item.accronym, 'g');
                    const tag = this.sanitizeTag(item.tag);
                    return currentOutput.replaceAll(acronymRegex, tag);
                } catch (error) {
                    console.warn(`Failed to process abbreviation: ${item.accronym}`, error);
                    return currentOutput;
                }
            }, output);
        }

        sanitizeTag(tag) {
            // Convert to string and clean up quotes
            const tagString = typeof tag === 'string' ? tag : JSON.stringify(tag);
            return tagString
                .replace(/^"|"$/g, '') // Remove leading/trailing quotes
                .replaceAll("'", '"'); // Normalize quotes
        }

        autoProcessH2s(output) {
            const h2Elements = output.match(/<h2[^>]*>.*?<\/h2>/g);
            
            if (!h2Elements) {
                console.warn('No h2 elements found');
                return output;
            }

            // Extract clean text from H2 elements for IDs
            const h2Data = h2Elements.map(element => {
                const textMatch = element.match(/(?<=<h2[^>]*>)(.*?)(?=<\/h2>)/);
                return textMatch ? textMatch[0].trim() : null;
            }).filter(Boolean);

            // Add IDs to H2 elements
            h2Elements.forEach((element, index) => {
                if (h2Data[index]) {
                    const id = this.createValidId(h2Data[index]);
                    // Check if ID already exists
                    if (!element.includes('id=')) {
                        const newElement = element.replace('<h2', `<h2 id="${id}"`);
                        output = output.replace(element, newElement);
                    }
                }
            });

            // Process "On this page" section if it exists
            output = this.processOnThisPageLinks(output, h2Data);

            return output;
        }

        createValidId(text) {
            // Convert to lowercase and replace spaces/special chars with hyphens
            return text.toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        }

        processOnThisPageLinks(output, h2Data) {
            // Check if first H2 is "On this page" (case insensitive)
            if (!h2Data.length || !h2Data[0].toLowerCase().includes('on this page')) {
                return output;
            }

            // Get the content H2s (excluding "On this page")
            const contentH2s = h2Data.slice(1);
            
            // Find and process list items in the "On this page" section
            const onThisPagePattern = /<h2[^>]*>.*?on this page.*?<\/h2>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i;
            const onThisPageMatch = output.match(onThisPagePattern);
            
            if (!onThisPageMatch) {
                console.warn('Could not find "On this page" section with list');
                return output;
            }

            const listItems = onThisPageMatch[1].match(/<li>.*?<\/li>/g);
            if (!listItems) {
                return output;
            }

            // Replace each list item with linked version
            listItems.forEach((item, index) => {
                if (contentH2s[index]) {
                    const textMatch = item.match(/(?<=<li>)(.*?)(?=<\/li>)/);
                    if (textMatch) {
                        const linkText = textMatch[0].trim();
                        const targetId = this.createValidId(contentH2s[index]);
                        const newItem = `<li><a href="#${targetId}">${linkText}</a></li>`;
                        output = output.replace(item, newItem);
                    }
                }
            });

            return output;
        }

        manualH2Processing() {
            if (!this.processedOutput) {
                console.warn('No processed output available');
                return;
            }

            let output = this.autoProcessH2s(this.processedOutput);
            this.processedOutput = output;
            this.displayResult(output);
        }

        displayResult(output) {
            const outputElement = document.getElementById('output');
            const htmlDataElement = document.getElementById('html-data');

            if (outputElement) {
                outputElement.innerHTML = output;
            }

            if (htmlDataElement) {
                // Format and indent the HTML before displaying in textarea
                const formattedOutput = this.formatHtml(output);
                htmlDataElement.value = formattedOutput;
            }
        }

        formatHtml(html) {
            // Remove extra whitespace and normalize
            let formatted = html.trim();
            
            // Add proper line breaks after closing tags
            formatted = formatted.replace(/(<\/[^>]+>)(?![\s\n])/g, '$1\n');
            
            // Add line breaks before opening tags (except inline elements)
            formatted = formatted.replace(/(<(?:h[1-6]|div|p|table|tr|td|th|ul|ol|li|section|article|header|footer|nav|main)[^>]*>)/g, '\n$1');
            
            // Split into lines for processing
            const lines = formatted.split('\n').filter(line => line.trim() !== '');
            const indentedLines = [];
            let indentLevel = 0;
            const indentSize = 2; // Number of spaces per indent level
            
            // Tags that should decrease indent before themselves
            const closingTags = ['</h1>', '</h2>', '</h3>', '</h4>', '</h5>', '</h6>', 
                               '</div>', '</p>', '</table>', '</tr>', '</td>', '</th>', 
                               '</ul>', '</ol>', '</li>', '</section>', '</article>', 
                               '</header>', '</footer>', '</nav>', '</main>'];
            
            // Tags that should increase indent after themselves
            const openingTags = ['<h1', '<h2', '<h3', '<h4', '<h5', '<h6', 
                               '<div', '<p', '<table', '<tr', '<td', '<th', 
                               '<ul', '<ol', '<li', '<section', '<article', 
                               '<header', '<footer', '<nav', '<main'];
            
            // Self-closing or inline tags that don't affect indentation
            const inlineTags = ['<br', '<img', '<a', '<span', '<strong', '<em', '<b', '<i'];
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;
                
                // Check if this is a closing tag that should decrease indent
                const isClosingTag = closingTags.some(tag => trimmedLine.startsWith(tag));
                if (isClosingTag) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                // Add the indented line
                const indent = ' '.repeat(indentLevel * indentSize);
                indentedLines.push(indent + trimmedLine);
                
                // Check if this is an opening tag that should increase indent
                const isOpeningTag = openingTags.some(tag => trimmedLine.startsWith(tag));
                const isInlineTag = inlineTags.some(tag => trimmedLine.includes(tag));
                const isSelfClosing = trimmedLine.endsWith('/>') || trimmedLine.includes('</');
                
                if (isOpeningTag && !isInlineTag && !isSelfClosing) {
                    indentLevel++;
                }
            });
            
            return indentedLines.join('\n');
        }

        async copyToClipboard() {
            const htmlDataElement = document.getElementById('html-data');
            if (!htmlDataElement || !htmlDataElement.value) {
                console.warn('No content to copy');
                return;
            }

            try {
                await navigator.clipboard.writeText(htmlDataElement.value);
                alert('Content copied to clipboard!');
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                // Fallback for older browsers
                try {
                    htmlDataElement.select();
                    document.execCommand('copy');
                    alert('Content copied to clipboard!');
                } catch (fallbackError) {
                    console.error('Fallback copy failed:', fallbackError);
                    alert('Failed to copy to clipboard');
                }
            }
        }

        escapeHtml(value) {
            return value
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }

    // Initialize when DOM is ready
    if (typeof $ !== 'undefined' && $.fn) {
        // jQuery is available
        $(document).ready(() => {
            new DocumentProcessor();
        });
    } else {
        // Fallback to vanilla JS
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new DocumentProcessor();
            });
        } else {
            new DocumentProcessor();
        }
    }

})();