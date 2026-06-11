import re

with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Extract blocks
visualizer_match = re.search(r'(\s*{/\* New Tool: Code Visualizer \*/}.*?</Link>)', content, re.DOTALL)
snippet_match = re.search(r'(\s*{/\* New Tool: Code Snippet Manager \*/}.*?</Link>)', content, re.DOTALL)
glassmorphism_match = re.search(r'(\s*{/\* New Tool: Glassmorphism Generator \*/}.*?</Link>)', content, re.DOTALL)

if not (visualizer_match and snippet_match and glassmorphism_match):
    print("Blocks not found")
    exit(1)

visualizer_block = visualizer_match.group(1)
snippet_block = snippet_match.group(1)
glassmorphism_block = glassmorphism_match.group(1)

# Remove them from the bottom
content = content.replace(visualizer_block, "")
content = content.replace(snippet_block, "")
content = content.replace(glassmorphism_block, "")

# Find where to insert them (after CamScanner)
camscanner_end_idx = content.find('</Link>', content.find('href="/tools/camscanner"')) + len('</Link>')

new_content = (
    content[:camscanner_end_idx] +
    visualizer_block +
    snippet_block +
    glassmorphism_block +
    content[camscanner_end_idx:]
)

with open("src/app/page.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully reordered tools.")
