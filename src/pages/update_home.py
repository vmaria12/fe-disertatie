import os

file_path = r'd:\Disertatie\fe-disertatie\src\pages\Home.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 329 is index 328
line_idx = 328
target_line = lines[line_idx]
check_line_idx = 335 # Line 336
check_line = lines[check_line_idx]

print(f"Line {line_idx+1}: {target_line.strip()}")
print(f"Line {check_line_idx+1}: {check_line.strip()}")

if 'cropped-image-classification-results' in target_line and 'Detecție, Segmentare & Clasificare' in check_line:
    print("Found target lines. Replacing...")
    lines[line_idx] = target_line.replace('cropped-image-classification-results', 'sam-image-classification-results')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done.")
else:
    print("Target lines not found or do not match expected content.")
