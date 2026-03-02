#!/usr/bin/env python3
"""从原网站抓取图片"""
import os
import re
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

BASE_URL = "https://meetinginbeijing.com"
OUTPUT_DIR = "/Users/zj/git/meetinginbeijing/web/public/images"

def download_image(url, output_path):
    """下载单张图片"""
    try:
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"✓ Downloaded: {url} -> {output_path}")
        return True
    except Exception as e:
        print(f"✗ Failed: {url} - {e}")
        return False

def fetch_images_from_page(url_path):
    """从页面抓取图片"""
    url = urljoin(BASE_URL, url_path)
    try:
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        images = []
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src:
                full_url = urljoin(BASE_URL, src)
                images.append(full_url)
        return images
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 抓取各个页面的图片
    pages = ['/', '/about/', '/services/', '/how-it-works/', '/blog/', '/contact/']
    all_images = set()
    
    for page in pages:
        print(f"\nFetching images from {page}...")
        images = fetch_images_from_page(page)
        all_images.update(images)
    
    print(f"\n\nFound {len(all_images)} unique images")
    
    # 下载所有图片
    downloaded = 0
    for img_url in sorted(all_images):
        # 生成本地文件名
        parsed = urlparse(img_url)
        filename = os.path.basename(parsed.path)
        if not filename or '.' not in filename:
            continue
        
        output_path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(output_path):
            print(f"Skipping (exists): {filename}")
            continue
            
        if download_image(img_url, output_path):
            downloaded += 1
    
    print(f"\n\nTotal downloaded: {downloaded} images")
    print(f"Output directory: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
