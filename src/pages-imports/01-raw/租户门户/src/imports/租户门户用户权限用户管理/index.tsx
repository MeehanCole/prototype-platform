import svgPaths from "./svg-rmintftu8c";

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
    <div className="-translate-y-1/2 absolute h-[28px] left-[1248.59px] top-1/2 w-[218.41px]" data-name="Container">
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
    <div className="absolute bg-[#1e5aa8] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.08)] h-[56px] left-0 right-[-137px] top-0" data-name="Top Header Bar (56px, blue #1e5aa8)">
      <Container />
      <Nav />
      <Container1 />
    </div>
  );
}

function Label() {
  return (
    <div className="absolute h-[22px] left-[37px] right-[-36.67px] top-[35px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[432.59px]">
        <p className="leading-[22px]">账号</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11.41px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[8.5px] w-[408.59px]">
        <p className="leading-[normal]">请输入账号/手机号/UASS账号</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[84px] overflow-clip right-[-0.08px] rounded-[4px] top-[30px]" data-name="Input">
      <Container5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[22px] left-[23px] right-[-22.67px] top-[38px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[432.59px]">
        <p className="leading-[22px]">安全邮箱</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11.41px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[8.5px] w-[408.59px]">
        <p className="leading-[normal]">请输入安全邮箱</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[102.08px] overflow-clip right-[-0.15px] rounded-[4px] top-[30px]" data-name="Input">
      <Container7 />
    </div>
  );
}

function Container6() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Label1 />
      <Input1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute h-[22px] left-[29px] right-[-28.67px] top-[37px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[432.59px]">
        <p className="leading-[22px]">手机号码</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11.41px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[8.5px] w-[408.59px]">
        <p className="leading-[normal]">请输入手机号码</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[110.15px] overflow-clip right-[0.77px] rounded-[4px] top-[30px]" data-name="Input">
      <Container9 />
    </div>
  );
}

function Container8() {
  return (
    <div className="col-3 h-[62px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Label2 />
      <Input2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute h-[22px] left-0 right-[0.33px] top-[35px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[432.59px]">
        <p className="leading-[22px]">UASS账号</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11.41px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[8.5px] w-[408.59px]">
        <p className="leading-[normal]">请输入UASS账号</p>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[85px] overflow-clip right-[-0.08px] rounded-[4px] top-[30px]" data-name="Input">
      <Container11 />
    </div>
  );
}

function Container10() {
  return (
    <div className="col-1 h-[62px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Label3 />
      <Input3 />
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute h-[22px] left-[16px] right-[-15.67px] top-[39px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[432.59px]">
        <p className="leading-[22px]">8位员工号</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11.41px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[8.5px] w-[408.59px]">
        <p className="leading-[normal]">请输入8位员工号</p>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[108.08px] overflow-clip right-[-0.15px] rounded-[4px] top-[30px]" data-name="Input">
      <Container13 />
    </div>
  );
}

function Container12() {
  return (
    <div className="col-2 h-[62px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Label4 />
      <Input4 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute gap-x-[16px] gap-y-[16px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[__62px_62px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Container4 />
      <Container6 />
      <Container8 />
      <Container10 />
      <Container12 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="-translate-y-1/2 absolute left-[16px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d="M12.25 12.25L9.71833 9.71833" id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p20be6400} id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[28px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">查询</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[32px] left-0 rounded-[4px] top-1/2 w-[78px]" data-name="Button">
      <Svg4 />
      <Container15 />
    </div>
  );
}

function Container16() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[16px] top-1/2 w-[28px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">重置</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[86px] rounded-[4px] top-1/2 w-[62px]" data-name="Button">
      <Container16 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[32px] left-[625px] right-[-577px] top-[184px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function SearchFilterSection() {
  return (
    <div className="absolute bg-white border border-[#e8e8e8] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[238px] left-[24px] right-[24px] rounded-[8px] top-[24px]" data-name="Search / Filter Section">
      <Container3 />
      <Container14 />
    </div>
  );
}

function Svg5() {
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

function Container17() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[70px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">添加子账号</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[32px] left-0 rounded-[4px] top-1/2 w-[120px]" data-name="Button">
      <Svg5 />
      <Container17 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="-translate-y-1/2 absolute left-[16px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d="M7 1.75V8.75" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d={svgPaths.p2ed38dc0} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d={svgPaths.pdf0f80} id="Vector_3" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">导入模板</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[128px] rounded-[4px] top-1/2 w-[108px]" data-name="Button">
      <Svg6 />
      <Container18 />
    </div>
  );
}

function Svg7() {
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

function Container19() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[28px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">删除</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[244px] rounded-[4px] top-1/2 w-[80px]" data-name="Button">
      <Svg7 />
      <Container19 />
    </div>
  );
}

function Svg8() {
  return (
    <div className="-translate-y-1/2 absolute left-[7px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d={svgPaths.p385f1300} id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d="M5.25 1.75V12.25" id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
          <path d="M8.75 1.75V12.25" id="Vector_3" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[34px] top-1/2 w-[42px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">添加到组</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-[332px] rounded-[4px] top-1/2 w-[94px]" data-name="Button">
      <Svg8 />
      <Container20 />
    </div>
  );
}

function ActionButtonRow() {
  return (
    <div className="absolute h-[32px] left-[24px] right-[24px] top-[278px]" data-name="Action Button Row">
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[25.5px] right-[1230.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">账号ID</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[99.5px] right-[1030.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">账号名称</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[299.5px] right-[830.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">昵称</p>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[499.5px] right-[742.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">账号类型</p>
      </div>
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[587.5px] right-[654.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">安全邮箱</p>
      </div>
    </div>
  );
}

function Cell5() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[675.5px] right-[566.27px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">手机号码</p>
      </div>
    </div>
  );
}

function Cell6() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[763.5px] right-[468.14px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">UASS账号</p>
      </div>
    </div>
  );
}

function Cell7() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[861.63px] right-[372.34px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">8位员工号</p>
      </div>
    </div>
  );
}

function Cell8() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[957.43px] right-[284.34px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">注册时间</p>
      </div>
    </div>
  );
}

function Cell9() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[1045.43px] right-[196.34px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">账号状态</p>
      </div>
    </div>
  );
}

function Cell10() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[1133.43px] right-[25.5px] top-0" data-name="Cell">
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
      <Cell3 />
      <Cell4 />
      <Cell5 />
      <Cell6 />
      <Cell7 />
      <Cell8 />
      <Cell9 />
      <Cell10 />
    </div>
  );
}

function Data() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46119</p>
        <p className="leading-[22px]">711</p>
      </div>
    </div>
  );
}

function Data1() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">test051514</p>
      </div>
    </div>
  );
}

function Data2() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">测试账号管理员测试</p>
      </div>
    </div>
  );
}

function Data3() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data4() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">t@cpic.c</p>
        <p className="leading-[22px]">om</p>
      </div>
    </div>
  );
}

function Data5() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1382222</p>
        <p className="leading-[22px]">6666</p>
      </div>
    </div>
  );
}

function Data6() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">u513760</p>
        <p className="leading-[22px]">0.zh</p>
      </div>
    </div>
  );
}

function Data7() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">u5137600</p>
      </div>
    </div>
  );
}

function Data8() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-12 14:0</p>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[28.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data9() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder />
    </div>
  );
}

function Data10() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[83px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[41.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="absolute h-[83px] left-0 right-0 top-0" data-name="Row">
      <Data />
      <Data1 />
      <Data2 />
      <Data3 />
      <Data4 />
      <Data5 />
      <Data6 />
      <Data7 />
      <Data8 />
      <Data9 />
      <Data10 />
    </div>
  );
}

function Data11() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46119</p>
        <p className="leading-[22px]">710</p>
      </div>
    </div>
  );
}

function Data12() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">test051511</p>
      </div>
    </div>
  );
}

function Data13() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">测试0515</p>
      </div>
    </div>
  );
}

function Data14() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data15() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">h@cpic.</p>
        <p className="leading-[22px]">com</p>
      </div>
    </div>
  );
}

function Data16() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1350000</p>
        <p className="leading-[22px]">6666</p>
      </div>
    </div>
  );
}

function Data17() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">u513760</p>
        <p className="leading-[22px]">0.zh</p>
      </div>
    </div>
  );
}

function Data18() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">u5137600</p>
      </div>
    </div>
  );
}

function Data19() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-15 11:0</p>
      </div>
    </div>
  );
}

function OverlayBorder1() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[28.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data20() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder1 />
    </div>
  );
}

function Data21() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[83px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[41.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="absolute h-[83px] left-0 right-0 top-[83px]" data-name="Row">
      <Data11 />
      <Data12 />
      <Data13 />
      <Data14 />
      <Data15 />
      <Data16 />
      <Data17 />
      <Data18 />
      <Data19 />
      <Data20 />
      <Data21 />
    </div>
  );
}

function Data22() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46133</p>
        <p className="leading-[22px]">356</p>
      </div>
    </div>
  );
}

function Data23() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] overflow-hidden text-[14px] text-[rgba(0,0,0,0.85)] text-ellipsis top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">test222222222222222222222</p>
      </div>
    </div>
  );
}

function Data24() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] overflow-hidden text-[14px] text-[rgba(0,0,0,0.85)] text-ellipsis top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">test222222222222222222222</p>
      </div>
    </div>
  );
}

function Data25() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data26() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">zhangyi.</p>
        <p className="leading-[22px] mb-0">zh@cpi</p>
        <p className="leading-[22px]">c.com</p>
      </div>
    </div>
  );
}

function Data27() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1381116</p>
        <p className="leading-[22px]">6666</p>
      </div>
    </div>
  );
}

function Data28() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">zhangyi.z</p>
        <p className="leading-[22px]">h</p>
      </div>
    </div>
  );
}

function Data29() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">96536998</p>
      </div>
    </div>
  );
}

function Data30() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-06</p>
        <p className="leading-[22px]">-11 14:0</p>
      </div>
    </div>
  );
}

function OverlayBorder2() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[28.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data31() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder2 />
    </div>
  );
}

function Data32() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[83px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[41.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="absolute h-[83px] left-0 right-0 top-[166px]" data-name="Row">
      <Data22 />
      <Data23 />
      <Data24 />
      <Data25 />
      <Data26 />
      <Data27 />
      <Data28 />
      <Data29 />
      <Data30 />
      <Data31 />
      <Data32 />
    </div>
  );
}

function Data33() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46133</p>
        <p className="leading-[22px]">354</p>
      </div>
    </div>
  );
}

function Data34() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] overflow-hidden text-[14px] text-[rgba(0,0,0,0.85)] text-ellipsis top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">zhangguan10.zh@cpic.com</p>
      </div>
    </div>
  );
}

function Data35() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">zhangguan10.zh</p>
      </div>
    </div>
  );
}

function Data36() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data37() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">zhanggu</p>
        <p className="leading-[22px] mb-0">an10.zh</p>
        <p className="leading-[22px] mb-0">@cpic.c</p>
        <p className="leading-[22px]">om</p>
      </div>
    </div>
  );
}

function Data38() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1352666</p>
        <p className="leading-[22px]">8888</p>
      </div>
    </div>
  );
}

function Data39() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">zhanggua</p>
        <p className="leading-[22px]">n10.zh</p>
      </div>
    </div>
  );
}

function Data40() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">95219098</p>
      </div>
    </div>
  );
}

function Data41() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-11 20:0</p>
      </div>
    </div>
  );
}

function OverlayBorder3() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[39.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data42() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[105px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder3 />
    </div>
  );
}

function Data43() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[105px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[52.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[52.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[52.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[52.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[52.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="absolute h-[105px] left-0 right-0 top-[249px]" data-name="Row">
      <Data33 />
      <Data34 />
      <Data35 />
      <Data36 />
      <Data37 />
      <Data38 />
      <Data39 />
      <Data40 />
      <Data41 />
      <Data42 />
      <Data43 />
    </div>
  );
}

function Data44() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46133</p>
        <p className="leading-[22px]">353</p>
      </div>
    </div>
  );
}

function Data45() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">peiyuan99.zh</p>
      </div>
    </div>
  );
}

function Data46() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">peiyuan.zh</p>
      </div>
    </div>
  );
}

function Data47() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data48() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">peiyuan.</p>
        <p className="leading-[22px] mb-0">zh@cpi</p>
        <p className="leading-[22px]">c.com</p>
      </div>
    </div>
  );
}

function Data49() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1352666</p>
        <p className="leading-[22px]">8888</p>
      </div>
    </div>
  );
}

function Data50() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">u513760</p>
        <p className="leading-[22px]">0.zh</p>
      </div>
    </div>
  );
}

function Data51() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">u5137600</p>
      </div>
    </div>
  );
}

function Data52() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-11 20:0</p>
      </div>
    </div>
  );
}

function OverlayBorder4() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[28.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data53() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder4 />
    </div>
  );
}

function Data54() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[83px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[41.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="absolute h-[83px] left-0 right-0 top-[354px]" data-name="Row">
      <Data44 />
      <Data45 />
      <Data46 />
      <Data47 />
      <Data48 />
      <Data49 />
      <Data50 />
      <Data51 />
      <Data52 />
      <Data53 />
      <Data54 />
    </div>
  );
}

function Data55() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46133</p>
        <p className="leading-[22px]">352</p>
      </div>
    </div>
  );
}

function Data56() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">changxian.zh</p>
      </div>
    </div>
  );
}

function Data57() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">changxian.zh</p>
      </div>
    </div>
  );
}

function Data58() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data59() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">changxi</p>
        <p className="leading-[22px] mb-0">an.zh@c</p>
        <p className="leading-[22px]">pic.com</p>
      </div>
    </div>
  );
}

function Data60() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1536666</p>
        <p className="leading-[22px]">6666</p>
      </div>
    </div>
  );
}

function Data61() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">changxia</p>
        <p className="leading-[22px]">n.zh</p>
      </div>
    </div>
  );
}

function Data62() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px]">43355223</p>
      </div>
    </div>
  );
}

function Data63() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[41.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-11 20:0</p>
      </div>
    </div>
  );
}

function OverlayBorder5() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[28.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data64() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[83px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder5 />
    </div>
  );
}

function Data65() {
  return (
    <div className="[word-break:break-word] absolute border-[#f0f0f0] border-b border-solid h-[83px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[41.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[41.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[41.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="absolute h-[83px] left-0 right-0 top-[437px]" data-name="Row">
      <Data55 />
      <Data56 />
      <Data57 />
      <Data58 />
      <Data59 />
      <Data60 />
      <Data61 />
      <Data62 />
      <Data63 />
      <Data64 />
      <Data65 />
    </div>
  );
}

function Data66() {
  return (
    <div className="absolute h-[104.5px] left-[25.5px] right-[1230.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">10000</p>
        <p className="leading-[22px] mb-0">46133</p>
        <p className="leading-[22px]">351</p>
      </div>
    </div>
  );
}

function Data67() {
  return (
    <div className="absolute h-[104.5px] left-[99.5px] overflow-clip right-[1030.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">jiaxusheng99.zh</p>
      </div>
    </div>
  );
}

function Data68() {
  return (
    <div className="absolute h-[104.5px] left-[299.5px] overflow-clip right-[830.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">jiaxusheng.zh</p>
      </div>
    </div>
  );
}

function Data69() {
  return (
    <div className="absolute h-[104.5px] left-[499.5px] right-[742.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">子账号</p>
      </div>
    </div>
  );
}

function Data70() {
  return (
    <div className="absolute h-[104px] left-[587.5px] right-[654.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">jiaxushe</p>
        <p className="leading-[22px] mb-0">ng99.zh</p>
        <p className="leading-[22px] mb-0">@cpic.c</p>
        <p className="leading-[22px]">om</p>
      </div>
    </div>
  );
}

function Data71() {
  return (
    <div className="absolute h-[104.5px] left-[675.5px] right-[566.27px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">1356666</p>
        <p className="leading-[22px]">6555</p>
      </div>
    </div>
  );
}

function Data72() {
  return (
    <div className="absolute h-[104.5px] left-[763.5px] right-[468.14px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">jiaxushen</p>
        <p className="leading-[22px]">g.zh</p>
      </div>
    </div>
  );
}

function Data73() {
  return (
    <div className="absolute h-[104.5px] left-[861.63px] right-[372.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px]">11087823</p>
      </div>
    </div>
  );
}

function Data74() {
  return (
    <div className="absolute h-[104.5px] left-[957.43px] right-[284.34px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[52.5px] whitespace-nowrap">
        <p className="leading-[22px] mb-0">2024-05</p>
        <p className="leading-[22px]">-11 20:0</p>
      </div>
    </div>
  );
}

function OverlayBorder6() {
  return (
    <div className="absolute bg-[rgba(82,196,26,0.1)] border border-[rgba(82,196,26,0.2)] border-solid h-[26px] left-[16px] rounded-[4px] top-[39.5px] w-[54px]" data-name="Overlay+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[8px] text-[#52c41a] text-[12px] top-[12px] whitespace-nowrap">
        <p className="leading-[20px]">已启用</p>
      </div>
    </div>
  );
}

function Data75() {
  return (
    <div className="absolute h-[104.5px] left-[1045.43px] right-[196.34px] top-0" data-name="Data">
      <OverlayBorder6 />
    </div>
  );
}

function Data76() {
  return (
    <div className="[word-break:break-word] absolute h-[104.5px] leading-[0] left-[1133.43px] right-[25.5px] text-[14px] top-0 whitespace-nowrap" data-name="Data">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[16px] text-[#1890ff] top-[52.5px]">
        <p>
          <span className="leading-[22px]">查看</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[55.89px] text-[#d9d9d9] top-[52.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[71.42px] text-[#1890ff] top-[52.5px]">
        <p>
          <span className="leading-[22px]">编辑</span>
          <span className="[word-break:break-word] font-['Monda:Regular','Noto_Sans_SC:Medium',sans-serif] font-normal leading-[22px] text-[rgba(0,0,0,0.85)]">{` `}</span>
        </p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-[111.31px] text-[#d9d9d9] top-[52.5px]">
        <p className="leading-[22px]">|</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[126.85px] text-[#ff4d4f] top-[52.5px]">
        <p className="leading-[22px]">删除</p>
      </div>
    </div>
  );
}

function Row6() {
  return (
    <div className="absolute h-[104.5px] left-0 right-0 top-[520px]" data-name="Row">
      <Data66 />
      <Data67 />
      <Data68 />
      <Data69 />
      <Data70 />
      <Data71 />
      <Data72 />
      <Data73 />
      <Data74 />
      <Data75 />
      <Data76 />
    </div>
  );
}

function Body() {
  return (
    <div className="absolute h-[624.5px] left-0 right-0 top-[48px]" data-name="Body">
      <Row />
      <Row1 />
      <Row2 />
      <Row3 />
      <Row4 />
      <Row5 />
      <Row6 />
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[672.5px] left-[24px] overflow-auto right-[24px] top-[24px]" data-name="Table">
      <HeaderRow />
      <Body />
    </div>
  );
}

function SectionDataTableCard() {
  return (
    <div className="absolute bg-white border border-[#e8e8e8] border-solid drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[722.5px] left-[24px] right-[24px] rounded-[8px] top-[326px]" data-name="Section - Data Table Card">
      <Table />
    </div>
  );
}

function Container21() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] right-[132.36px] top-1/2 w-[43.58px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] left-[-8px] text-[14px] text-[rgba(0,0,0,0.45)] top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">共 7 条</p>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid right-[93.36px] rounded-[4px] size-[32px] top-1/2" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%-0.41px)] text-[#1890ff] text-[14px] text-center top-[calc(50%-0.5px)] whitespace-nowrap">
        <p className="leading-[21px]">1</p>
      </div>
    </div>
  );
}

function Svg9() {
  return (
    <div className="-translate-y-1/2 absolute left-[63.36px] size-[12px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="SVG">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] right-0 rounded-[4px] top-1/2 w-[85.36px]" data-name="Background+Border">
      <Svg9 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium',sans-serif] font-medium justify-center leading-[0] left-[28.59px] text-[14px] text-black top-[14px] whitespace-nowrap">
        <p className="leading-[21px]">10</p>
      </div>
    </div>
  );
}

function Pagination() {
  return (
    <div className="absolute h-[32px] left-[24px] right-[24px] top-[1064.5px]" data-name="Pagination">
      <Container21 />
      <BackgroundBorder />
      <BackgroundBorder1 />
    </div>
  );
}

function ContentAreaScrollableF0F2F524PxPadding() {
  return (
    <div className="absolute bg-[#f0f2f5] inset-[0_-136.77px_0_200px]" data-name="Content Area (scrollable, #f0f2f5, 24px padding)">
      <SearchFilterSection />
      <ActionButtonRow />
      <SectionDataTableCard />
      <Pagination />
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[44px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[20px] text-[12px] text-[rgba(255,255,255,0.35)] top-[26px] tracking-[0.24px] uppercase w-[160px]">
        <p className="leading-[20px]">用户权限</p>
      </div>
    </div>
  );
}

function Container23() {
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
      <Container23 />
    </div>
  );
}

function Container25() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">角色管理</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[84px]" data-name="Container">
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">策略管理</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[124px]" data-name="Container">
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">云API密钥</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[164px]" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[20px] top-1/2 w-[160px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[160px]">
        <p className="leading-[40px]">UASS认证管理</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[204px]" data-name="Container">
      <Container31 />
    </div>
  );
}

function Nav1() {
  return (
    <div className="absolute h-[244px] left-0 right-0 top-0" data-name="Nav">
      <Container22 />
      <Background />
      <Container24 />
      <Container26 />
      <Container28 />
      <Container30 />
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

function BodySidebarContent() {
  return (
    <div className="absolute inset-[56px_0_0_0]" data-name="Body: Sidebar + Content">
      <ContentAreaScrollableF0F2F524PxPadding />
      <AsideLeftSidebar200PxDark />
    </div>
  );
}

export default function Component() {
  return (
    <div className="relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(240, 242, 245) 0%, rgb(240, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="租户门户-用户权限-用户管理">
      <TopHeaderBar56PxBlue1E5Aa />
      <BodySidebarContent />
    </div>
  );
}