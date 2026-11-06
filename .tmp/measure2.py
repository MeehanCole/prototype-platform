from PIL import Image
im = Image.open("docs/在线服务优化/assets/existing-product/01-在线服务.webp").convert("RGB")
px = im.load()
W,H = im.size
OX,OY = 20,20  # src product origin in webp

def prod(x,y): return (x+OX, y+OY)

# ---- 1. dot grid: product x15-50 y15-50 ----
print("== DOT GRID (product coords) ==")
minx,miny,maxx,maxy = 999,999,0,0
for y in range(15,50):
    for x in range(15,50):
        r,g,b = px[prod(x,y)]
        v = min(r,g,b)
        if v < 232 and max(r,g,b)-v < 25:  # grayish
            minx,miny,maxx,maxy = min(minx,x),min(miny,y),max(maxx,x),max(maxy,y)
print(f"gray extent: x{minx}-{maxx} y{miny}-{maxy}")
# per-row dot runs
for y in range(miny, maxy+1):
    runs=[]; s=None
    for x in range(15,50):
        r,g,b = px[prod(x,y)]
        on = min(r,g,b) < 232 and max(r,g,b)-min(r,g,b) < 25
        if on and s is None: s=x
        if not on and s is not None: runs.append((s,x-1)); s=None
    if s is not None: runs.append((s,49))
    if runs: print(f"  y{y}: {runs}")

# ---- 2. logo anatomy: product x68-124 y8-56 ----
print("== LOGO ==")
bl = [999,999,0,0]  # blue letters
si = [999,999,0,0]  # silver ring
for y in range(8,56):
    for x in range(68,124):
        r,g,b = px[prod(x,y)]
        if b-r > 40:
            bl[0]=min(bl[0],x); bl[1]=min(bl[1],y); bl[2]=max(bl[2],x); bl[3]=max(bl[3],y)
        elif 8 < b-r <= 60 and min(r,g,b) < 235:
            si[0]=min(si[0],x); si[1]=min(si[1],y); si[2]=max(si[2],x); si[3]=max(si[3],y)
print(f"blue letters bbox: x{bl[0]}-{bl[2]} y{bl[1]}-{bl[3]}")
print(f"silver ring bbox:  x{si[0]}-{si[2]} y{si[1]}-{si[3]}")
# sample ring top/bottom/left/right colors
for name,(x,y) in {"ring-top":((si[0]+si[2])//2, si[1]),"ring-bot":((si[0]+si[2])//2, si[3]),"ring-left":(si[0],(si[1]+si[3])//2),"ring-right":(si[2],(si[1]+si[3])//2)}.items():
    print(f"  {name} ({x},{y}): {px[prod(x,y)]}")
# letter column profile to split A vs I
cols=[]
for x in range(bl[0], bl[2]+1):
    c=0
    for y in range(bl[1], bl[3]+1):
        r,g,b = px[prod(x,y)]
        if b-r>40: c+=1
    cols.append((x,c))
prof = "".join('#' if c>0 else '.' for c in [0]*0)
import sys
line="".join('#' if c>0 else '.' for x,c in cols)
print("  letter col profile (x%d..%d): %s" % (bl[0], bl[2], line))

# ---- 3. button border box: product x290-445 y14-52 ----
print("== BUTTON ==")
minx,miny,maxx,maxy = 999,999,0,0
for y in range(14,52):
    for x in range(290,445):
        r,g,b = px[prod(x,y)]
        if min(r,g,b) < 235:
            minx,miny,maxx,maxy = min(minx,x),min(miny,y),max(maxx,x),max(maxy,y)
print(f"ink extent: x{minx}-{maxx} y{miny}-{maxy}")
# find light border: scan for pixels <245 only on column x=300 vertical
col=[]
for y in range(10,55):
    r,g,b = px[prod(300,y)]
    if min(r,g,b)<248: col.append(y)
print(f"  col x300 light rows: {col[:3]}..{col[-3:] if col else None}")
# border color sample at top edge mid
for y in range(miny, miny+3):
    print(f"  top edge y{y} x360: {px[prod(360,y)]}")

# ---- 4. right group ink runs: product x2380-2800, y18-48, thr200 ----
print("== RIGHT GROUP runs (thr200) ==")
runs=[]; s=None
for x in range(2380,2800):
    on=False
    for y in range(18,48):
        r,g,b = px[prod(x,y)]
        if min(r,g,b)<200: on=True; break
    if on and s is None: s=x
    if not on and s is not None: runs.append((s,x-1)); s=None
if s is not None: runs.append((s,2799))
for a,b in runs: print(f"  x{a}-{b} (w{b-a+1})")
