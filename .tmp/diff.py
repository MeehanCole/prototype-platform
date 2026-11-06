from PIL import Image
src = Image.open('docs/在线服务优化/assets/existing-product/01-在线服务.webp').convert('RGB')
mine = Image.open('.tmp/shot-final2.png').convert('RGB')
# product-rel crops: src origin (20,20); mine origin (204,57); height 1428
sc = src.crop((20, 20, 2815, 1448))
mc = mine.crop((204, 57, 2999, 1485))
print('crops', sc.size, mc.size)
sp = sc.load(); mp = mc.load()
w, h = sc.size
bad = 0
tot = w * h
for y in range(h):
    for x in range(w):
        r1, g1, b1 = sp[x, y]
        r2, g2, b2 = mp[x, y]
        if abs(r1 - r2) > 30 or abs(g1 - g2) > 30 or abs(b1 - b2) > 30:
            bad += 1
print('diff px:', bad, 'pct: %.4f' % (100.0 * bad / tot))