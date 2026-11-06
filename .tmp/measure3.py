from PIL import Image
src = Image.open('docs/在线服务优化/assets/existing-product/01-在线服务.webp').convert('RGB')
mine = Image.open('.tmp/shot-final2.png').convert('RGB')
sp = src.load(); mp = mine.load()
SO=(20,20); MO=(204,57)

def box(px, o, x0,y0,x1,y1, thr=160):
    minx=miny=10**9; maxx=maxy=-1; n=0
    for y in range(y0,y1):
        for x in range(x0,x1):
            r,g,b = px[o[0]+x, o[1]+y]
            if (r+g+b)/3 < thr:
                n+=1
                if x<minx:minx=x
                if x>maxx:maxx=x
                if y<miny:miny=y
                if y>maxy:maxy=y
    if n==0: return None
    return (minx,maxx,miny,maxy,n)

def hruns(px,o,x0,y0,x1,y1,thr=160):
    res=[]
    for y in range(y0,y1):
        run=None
        for x in range(x0,x1):
            r,g,b=px[o[0]+x,o[1]+y]
            ink=(r+g+b)/3<thr
            if ink:
                if run is None: run=[x,x]
                else: run[1]=x
            else:
                if run: res.append(run); run=None
        if run: res.append(run)
    return res

def vruns(px,o,x0,y0,x1,y1,thr=160):
    res=[]
    for x in range(x0,x1):
        run=None
        for y in range(y0,y1):
            r,g,b=px[o[0]+x,o[1]+y]
            ink=(r+g+b)/3<thr
            if ink:
                if run is None: run=[y,y]
                else: run[1]=y
            else:
                if run: res.append(run); run=None
        if run: res.append(run)
    return res

def bgspan(px,o,x0,x1,y,rgb,tol=8):
    xs=[]
    for x in range(x0,x1):
        r,g,b=px[o[0]+x,o[1]+y]
        if abs(r-rgb[0])<=tol and abs(g-rgb[1])<=tol and abs(b-rgb[2])<=tol:
            xs.append(x)
    if not xs: return None
    return (xs[0],xs[-1])

# product-rel y = abs - origin; header 66 -> pill center ~92, title ~167, item1 ~218, item2 ~263, sec ~311, sub1 ~353
P = [
  ('pill-bg-src ', bgspan(sp,SO,15,250,92,(237,241,248,))),
  ('pill-bg-mine', bgspan(mp,MO,15,250,92,(237,241,248,))),
  ('pill-txt-src ', box(sp,SO,20,78,180,108,170)),
  ('pill-txt-mine', box(mp,MO,20,78,180,108,170)),
  ('pill-ico-src ', box(sp,SO,175,78,235,108,170)),
  ('pill-ico-mine', box(mp,MO,175,78,235,108,170)),
  ('title-src  ', box(sp,SO,20,150,200,186)),
  ('title-mine ', box(mp,MO,20,150,200,186)),
  ('item1-src  ', hruns(sp,SO,20,206,200,230)),
  ('item1-mine ', hruns(mp,MO,20,206,200,230)),
  ('item1v-src ', vruns(sp,SO,20,206,200,230)),
  ('item1v-mine', vruns(mp,MO,20,206,200,230)),
  ('sub1-src   ', hruns(sp,SO,20,341,220,365)),
  ('sub1-mine  ', hruns(mp,MO,20,341,220,365)),
  ('sec-src(thr200)', hruns(sp,SO,20,299,200,323,200)),
  ('sec-mine(thr200)', hruns(mp,MO,20,299,200,323,200)),
  ('tabhdr1-src ', box(sp,SO,285,325,360,357)),
  ('tabhdr1-mine', box(mp,MO,285,325,360,357)),
  ('tabhdr2-src ', box(sp,SO,380,325,540,357)),
  ('tabhdr2-mine', box(mp,MO,380,325,540,357)),
  ('dat1-src   ', box(sp,SO,275,388,425,412)),
  ('dat1-mine  ', box(mp,MO,275,388,425,412)),
  ('dat2-src   ', box(sp,SO,480,388,660,412)),
  ('dat2-mine  ', box(mp,MO,480,388,660,412)),
  ('badge-src  ', box(sp,SO,660,388,760,412,200)),
  ('badge-mine ', box(mp,MO,660,388,760,412,200)),
  ('rg-admin-src ', box(sp,SO,2640,5,2796,62)),
  ('rg-admin-mine', box(mp,MO,2640,5,2795,62)),
  ('bell-src   ', box(sp,SO,2480,10,2530,60)),
  ('bell-mine  ', box(mp,MO,2480,10,2530,60)),
]
for name,val in P:
    print(f'{name}: {val}')
