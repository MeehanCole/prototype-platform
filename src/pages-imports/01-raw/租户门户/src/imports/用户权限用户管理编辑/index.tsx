import svgPaths from "./svg-q6fpqokexb";

function Container() {
  return (
    <div className="-translate-y-1/2 absolute h-[24px] left-[24px] top-1/2 w-[96px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[16px] text-white top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">统一运营平台</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[56px] left-[calc(50%-285.63px)] top-1/2 w-[68px]" data-name="Link">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[20px] text-[14px] text-white top-[28px] whitespace-nowrap">
        <p className="leading-[56px]">总览</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.316px] left-[calc(50%-204.32px)] top-1/2 w-[94.619px]" data-name="Link">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.3164" preserveAspectRatio="none" viewBox="0 0 94.6191 13.3164" width="94.6191">
        <g id="Link">
          <path d={svgPaths.p139cd200} fill="white" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.686px] left-[calc(50%-109.41px)] top-1/2 w-[95.207px]" data-name="Link">
      <div className="absolute inset-[0_0_-2.3%_0]">
        <svg className="block size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 95.207 14" width="95.207">
          <g id="Link">
            <path d={svgPaths.p1b624200} fill="white" id="Icon" />
            <rect fill="white" height="2" id="Horizontal Divider" rx="1" width="55" x="20" y="12" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.248px] left-[calc(50%-14.1px)] top-1/2 w-[95.398px]" data-name="Link">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.248" preserveAspectRatio="none" viewBox="0 0 95.3984 13.248" width="95.3984">
        <g id="Link">
          <path d={svgPaths.p21f2f400} fill="white" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link4() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.836px] left-[calc(50%+81.07px)] top-1/2 w-[94.947px]" data-name="Link">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.8359" preserveAspectRatio="none" viewBox="0 0 94.9473 13.8359" width="94.9473">
        <g id="Link">
          <path d={svgPaths.p2de55680} fill="white" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link5() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.727px] left-[calc(50%+176.37px)] top-1/2 w-[95.645px]" data-name="Link">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.7266" preserveAspectRatio="none" viewBox="0 0 95.6445 13.7266" width="95.6445">
        <g id="Link">
          <path d={svgPaths.p3979b900} fill="white" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Link6() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13.781px] left-[calc(50%+271.91px)] top-1/2 w-[95.439px]" data-name="Link">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.7812" preserveAspectRatio="none" viewBox="0 0 95.4395 13.7812" width="95.4395">
        <g id="Link">
          <path d={svgPaths.p2cabf000} fill="white" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Nav() {
  return (
    <div className="-translate-y-1/2 absolute h-[56px] left-[120px] right-[242.41px] top-1/2" data-name="Nav">
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
      <Link5 />
      <Link6 />
    </div>
  );
}

function Svg() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p15b54100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1222c980} id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="-translate-y-1/2 absolute bg-[rgba(255,255,255,0.25)] left-0 rounded-[14px] size-[28px] top-1/2" data-name="Overlay">
      <Svg />
    </div>
  );
}

function Container2() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[44px] top-1/2 w-[72.41px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">uopsub.zh1</p>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="-translate-y-1/2 absolute left-[132.41px] size-[18px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="SVG">
          <path d={svgPaths.p12051700} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p2d5cae00} id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Svg2() {
  return (
    <div className="-translate-y-1/2 absolute left-[166.41px] size-[18px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="SVG">
          <path d={svgPaths.p4cae600} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p32237760} id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Svg3() {
  return (
    <div className="-translate-y-1/2 absolute left-[200.41px] size-[18px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="SVG">
          <path d="M12 12.75L15.75 9L12 5.25" id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M15.75 9H6.75" id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p2a42e580} id="Vector_3" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function Container1() {
  return (
    <div className="-translate-y-1/2 absolute h-[28px] left-[1197.59px] top-1/2 w-[218.41px]" data-name="Container">
      <Overlay />
      <Container2 />
      <Svg1 />
      <Svg2 />
      <Svg3 />
    </div>
  );
}

function TopHeaderBar56PxBlue1E5Aa() {
  return (
    <div className="absolute bg-[#1e5aa8] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.08)] h-[56px] left-0 right-0 top-0" data-name="Top Header Bar (56px, blue #1e5aa8)">
      <Container />
      <Nav />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[44px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[20px] text-[12px] text-[rgba(255,255,255,0.35)] top-[26px] w-[160px]">
        <p className="leading-[20px]">用户权限</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-white top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">用户管理</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#1890ff] h-[40px] left-0 right-0 top-[44px]" data-name="Background">
      <Container4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">用户组管理</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[84px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">角色管理</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[124px]" data-name="Container">
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">云API密钥</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[164px]" data-name="Container">
      <Container10 />
    </div>
  );
}

function Container12() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">UASS认证管理</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[204px]" data-name="Container">
      <Container12 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="absolute h-[244px] left-0 right-0 top-0" data-name="Nav">
      <Container3 />
      <Background />
      <Container5 />
      <Container7 />
      <Container9 />
      <Container11 />
    </div>
  );
}

function AsideLeftSidebar200PxDark() {
  return (
    <div className="absolute bg-[#001529] bottom-0 left-0 top-0 w-[200px]" data-name="Aside - Left Sidebar (200px, dark #001529)">
      <Nav1 />
    </div>
  );
}

function Label() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">账号名称</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">ttest01514</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container15 />
    </div>
  );
}

function Container14() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">昵称</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[25px] left-[11px] overflow-auto right-[11px] top-[6px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11.5px] w-[539px]">
        <p className="leading-[normal]">删除纳管数据后测试</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container17 />
    </div>
  );
}

function Container16() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Label1 />
      <Input1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">UASS账号</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">88137693.zh</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container19 />
    </div>
  );
}

function Container18() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Label2 />
      <Input2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">控制台密码</p>
      </div>
    </div>
  );
}

function Link7() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-0 top-1/2 w-[563px]" data-name="Link">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[#1890ff] text-[14px] top-[10.5px] w-[563px]">
        <p className="leading-[21px]">[重置密码]</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[30px]" data-name="Container">
      <Link7 />
    </div>
  );
}

function Container20() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Label3 />
      <Container21 />
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">账号状态</p>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-0 rounded-[4px] top-1/2 w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[30px]" data-name="Container">
      <OverlayBorder />
    </div>
  );
}

function Container22() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-3 shrink-0" data-name="Container">
      <Label4 />
      <Container23 />
    </div>
  );
}

function Label5() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">安全邮箱</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">t5@qq.com</p>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container25 />
    </div>
  );
}

function Container24() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-3 shrink-0" data-name="Container">
      <Label5 />
      <Input3 />
    </div>
  );
}

function Label6() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">手机号码</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">13022226666</p>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container27 />
    </div>
  );
}

function Container26() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-4 shrink-0" data-name="Container">
      <Label6 />
      <Input4 />
    </div>
  );
}

function Label7() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[563px]">
        <p className="leading-[22px]">8位员工号</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">88137693</p>
      </div>
    </div>
  );
}

function Input5() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container29 />
    </div>
  );
}

function Container28() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-4 shrink-0" data-name="Container">
      <Label7 />
      <Input5 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute gap-x-[16px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[____62px_62px_62px_62px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Container14 />
      <Container16 />
      <Container18 />
      <Container20 />
      <Container22 />
      <Container24 />
      <Container26 />
      <Container28 />
    </div>
  );
}

function Button() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[32px] left-0 rounded-[4px] top-1/2 w-[60px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[calc(50%-0.5px)] whitespace-nowrap">
        <p className="leading-[21px]">确定</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[68px] rounded-[4px] top-1/2 w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[calc(50%-0.5px)] whitespace-nowrap">
        <p className="leading-[21px]">取消</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[32px] left-[540px] right-[-492px] top-[374px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function SectionCard1UserEditForm() {
  return (
    <div className="absolute bg-white border border-[#e8e8e8] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[426px] left-[24px] right-[24px] rounded-[8px] top-[69px]" data-name="Section - Card 1: User Edit Form">
      <Container13 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[24px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[16px] text-[rgba(0,0,0,0.85)] top-[12px] w-[1142px]">
        <p className="leading-[24px]">添加到组</p>
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="-translate-y-1/2 absolute left-[16px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d="M2.91667 7H11.0833" id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d="M7 2.91667V11.0833" id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[42px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">添加组</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[32px] left-0 rounded-[4px] top-1/2 w-[92px]" data-name="Button">
      <Svg4 />
      <Container33 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="-translate-y-1/2 absolute left-[16px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d="M5.83333 6.41667V9.91667" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d="M8.16667 6.41667V9.91667" id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d={svgPaths.p3ac73980} id="Vector_3" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d="M1.75 3.5H12.25" id="Vector_4" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d={svgPaths.p2ae97180} id="Vector_5" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container34() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[28px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">删除</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[100px] rounded-[4px] top-1/2 w-[80px]" data-name="Button">
      <Svg5 />
      <Container34 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[32px] left-[334px] right-[-286px] top-[64px]" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-0 right-[617.31px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">用户组名称</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[524.69px] right-[308.67px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">备注</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[833.33px] right-0 top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">操作</p>
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="absolute h-[48px] left-0 right-0 top-0" data-name="Header → Row">
      <Cell />
      <Cell1 />
      <Cell2 />
    </div>
  );
}

function BodyRowData() {
  return (
    <div className="absolute h-[22px] left-[16px] right-[16px] top-[61.25px]" data-name="Body → Row → Data">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.45)] text-center top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">暂无数据</p>
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[96px] left-[24px] overflow-auto right-[24px] top-[112px]" data-name="Table">
      <HeaderRow />
      <BodyRowData />
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute h-[16px] left-[11px] overflow-auto right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[8.5px] w-[539px]">
        <p className="leading-[normal]">搜索用户组名称</p>
      </div>
    </div>
  );
}

function Input6() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[24px] overflow-clip right-[907px] rounded-[4px] top-[63px]" data-name="Input">
      <Container35 />
    </div>
  );
}

function Card2Section() {
  return (
    <div className="absolute bg-white border border-[#e8e8e8] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[234px] left-[24px] right-[24px] rounded-[8px] top-[511px]" data-name="Card 2: 添加到组 Section">
      <Container31 />
      <Container32 />
      <Table />
      <Input6 />
    </div>
  );
}

function ContentAreaScrollableF0F2F524PxPadding() {
  return (
    <div className="absolute bg-[#f0f2f5] inset-[0_0_0_200px]" data-name="Content Area (scrollable, #f0f2f5, 24px padding)">
      <SectionCard1UserEditForm />
      <Card2Section />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[37px] text-[20px] text-[rgba(0,0,0,0.85)] top-[39px] w-[1192px]">
        <p className="leading-[28px]">用户管理</p>
      </div>
    </div>
  );
}

function BodySidebarContent() {
  return (
    <div className="absolute inset-[56px_0_0_0]" data-name="Body: Sidebar + Content">
      <AsideLeftSidebar200PxDark />
      <ContentAreaScrollableF0F2F524PxPadding />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute h-[821px] left-0 right-0 top-0" data-name="Main">
      <TopHeaderBar56PxBlue1E5Aa />
      <BodySidebarContent />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(240, 242, 245) 0%, rgb(240, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="用户权限-用户管理-编辑">
      <Main />
    </div>
  );
}