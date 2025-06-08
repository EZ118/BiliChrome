import os
import re
import shutil
import json
from zipfile import ZipFile, ZIP_DEFLATED

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(PROJECT_ROOT, 'dist')

def create_dist_dir():
    """创建并清空dist目录"""
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    os.makedirs(DIST_DIR)

def extract_js_references(html_file):
    """提取HTML文件中指定路径的JS引用"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r'<script\s+src="(\./js/(?!vendor/)[^"]+)"[^>]*></script>'
    matches = re.findall(pattern, content)
    
    js_files = []
    for rel_path in matches:
        abs_path = os.path.normpath(os.path.join(PROJECT_ROOT, rel_path))
        js_files.append(abs_path)
    return js_files

def find_shared_and_unique_js(home_js, options_js):
    """找出共享和独有的JS文件"""
    shared = []
    home_only = []
    options_only = []
    
    # 保持顺序的交集查找
    for js in home_js:
        if js in options_js and js not in shared:
            shared.append(js)
            
    for js in home_js:
        if js not in shared:
            home_only.append(js)
            
    for js in options_js:
        if js not in shared:
            options_only.append(js)
            
    return shared, home_only, options_only

def merge_js_files(file_paths, output_path):
    """合并JS文件"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as outfile:
        for path in file_paths:
            with open(path, 'r', encoding='utf-8') as infile:
                outfile.write(infile.read() + '\n')

def process_html_files():
    """处理HTML文件并替换JS引用"""
    for html_file in ['home.html', 'options.html']:
        output_path = os.path.join(DIST_DIR, os.path.basename(html_file))
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 移除非vendor的JS引用
        pattern = r'<script\s+src="(\./js/(?!vendor/)[^"]+)"[^>]*></script>'
        vendor_scripts = []
        def replace_script(match):
            src = match.group(1)
            if '/vendor/' in src:
                vendor_scripts.append(match.group(0))
                return match.group(0)
            return ''
        content = re.sub(pattern, replace_script, content)
        
        # 插入新的JS引用
        new_scripts = []
        if 'home' in html_file:
            new_scripts.append('<script src="./js/shared.dist.js"></script>')
            new_scripts.append('<script src="./js/home.dist.js"></script>')
        else:
            new_scripts.append('<script src="./js/shared.dist.js"></script>')
            new_scripts.append('<script src="./js/options.dist.js"></script>')
            
        # 保留vendor脚本并添加新引用
        all_scripts = vendor_scripts + new_scripts
        scripts_str = '\n'.join(all_scripts)
        
        # 插入到body末尾
        content = content.replace('</body>', f'{scripts_str}\n</body>')
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

def copy_static_files():
    """复制静态文件到dist目录"""
    # 复制CSS（保留目录结构）
    shutil.copytree('css', os.path.join(DIST_DIR, 'css'), 
                   dirs_exist_ok=True)
    
    # 复制图片（排除PSD文件）
    shutil.copytree('img', os.path.join(DIST_DIR, 'img'), 
                   dirs_exist_ok=True,
                   ignore=shutil.ignore_patterns('*.psd'))
    
    # 复制vendor目录
    vendor_src = os.path.join('js', 'vendor')
    if os.path.exists(vendor_src):
        shutil.copytree(vendor_src, os.path.join(DIST_DIR, 'js', 'vendor'), 
                       dirs_exist_ok=True)
    
    # 复制其他文件
    shutil.copy('LICENSE', DIST_DIR)
    shutil.copy('manifest_chromium.json', DIST_DIR)
    shutil.copy('manifest_firefox.json', DIST_DIR)
    shutil.copy('README.md', DIST_DIR)
    
    # 处理background.js
    background_src = os.path.join('js', 'background.js')
    if os.path.exists(background_src):
        os.makedirs(os.path.join(DIST_DIR, 'js'), exist_ok=True)
        shutil.copy(background_src, os.path.join(DIST_DIR, 'js', 'background.js'))

def get_version():
    """从manifest.json读取版本号"""
    with open('manifest.json', 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    return manifest['version']

def create_zip(version, browser):
    """创建指定浏览器的zip包"""
    zip_name = f"BiliScape_v{version}_{browser}.zip"
    zip_path = os.path.join(PROJECT_ROOT, zip_name)
    
    with ZipFile(zip_path, 'w', compression=ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(DIST_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, DIST_DIR)
                
                # 处理manifest文件
                if browser == 'chromium':
                    if arcname == 'manifest.json':
                        continue
                    if arcname == 'manifest_chromium.json':
                        arcname = 'manifest.json'
                elif browser == 'firefox':
                    if arcname == 'manifest.json':
                        continue
                    if arcname == 'manifest_firefox.json':
                        arcname = 'manifest.json'
                
                zipf.write(file_path, arcname)

def cleanup_dist_dir():
    """删除dist目录"""
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)

def main():
    create_dist_dir()
    
    # 提取JS引用
    home_js = extract_js_references('home.html')
    options_js = extract_js_references('options.html')
    
    # 分类JS文件
    shared_js, home_only, options_only = find_shared_and_unique_js(home_js, options_js)
    
    # 合并JS文件
    merge_js_files(shared_js, os.path.join(DIST_DIR, 'js', 'shared.dist.js'))
    merge_js_files(home_only, os.path.join(DIST_DIR, 'js', 'home.dist.js'))
    merge_js_files(options_only, os.path.join(DIST_DIR, 'js', 'options.dist.js'))
    
    # 处理HTML文件
    process_html_files()
    
    # 复制静态文件
    copy_static_files()
    
    # 创建zip包
    version = get_version()
    create_zip(version, 'chromium')
    create_zip(version, 'firefox')
    
    # 清理dist目录
    cleanup_dist_dir()

if __name__ == "__main__":
    main()