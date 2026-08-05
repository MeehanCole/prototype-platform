function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.45)] w-full">
        <p className="leading-[21px]">添加到组</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] whitespace-nowrap">
          <p className="leading-[24px]">添加到组</p>
        </div>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="18" preserveAspectRatio="none" viewBox="0 0 18 18" width="18">
        <g id="SVG">
          <path d="M13.5 4.5L4.5 13.5" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.5" />
          <path d="M4.5 4.5L13.5 13.5" id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[#e8e8e8] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[24px] relative size-full">
          <Container1 />
          <Svg />
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[38px] left-0 right-0 top-0" data-name="HorizontalBorder">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[14px] text-[rgba(0,0,0,0.85)] top-[18.5px] whitespace-nowrap">
        <p className="leading-[21px]">用户组列表</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="-translate-y-1/2 absolute h-[18px] left-[12px] top-1/2 w-[60px]" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[12px] text-[rgba(0,0,0,0.85)] top-[9px] whitespace-nowrap">
        <p className="leading-[18px]">用户组名称</p>
      </div>
    </div>
  );
}

function Input() {
  return <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[28px] left-[80px] right-[100px] rounded-[4px] top-1/2" data-name="Input" />;
}

function Button() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[28px] left-[250px] rounded-[4px] top-1/2 w-[48px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[12px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">查询</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="-translate-y-1/2 absolute h-[18px] left-[306px] top-1/2 w-[24px]" data-name="Link">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[#1890ff] text-[12px] top-[9px] whitespace-nowrap">
        <p className="leading-[18px]">重置</p>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[53px] left-0 right-0 top-[38px]" data-name="HorizontalBorder">
      <Label />
      <Input />
      <Button />
      <Link />
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[40px] left-0 right-[87.61px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[19.75px] whitespace-nowrap">
        <p className="leading-[22px]">用户组名称</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[40px] left-[254.39px] right-0 top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[19.75px] whitespace-nowrap">
        <p className="leading-[22px]">备注</p>
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Header → Row">
      <Cell />
      <Cell1 />
    </div>
  );
}

function Data() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">AAAAAA...</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-0" data-name="Row">
      <Data />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data1() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">test05121234566666</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[35px]" data-name="Row">
      <Data1 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data2() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">test051222</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[70px]" data-name="Row">
      <Data2 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data3() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">jhtest测试用户组0512</p>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[105px]" data-name="Row">
      <Data3 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data4() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">测试用户组0512</p>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[140px]" data-name="Row">
      <Data4 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data5() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">测试用户组0511</p>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[175px]" data-name="Row">
      <Data5 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data6() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">测试预设策略</p>
      </div>
    </div>
  );
}

function Row6() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[210px]" data-name="Row">
      <Data6 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data7() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">新建测试用户组2300</p>
      </div>
    </div>
  );
}

function Row7() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[245px]" data-name="Row">
      <Data7 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function Data8() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-0 right-[87.61px] top-0" data-name="Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">新建测试用户组2036</p>
      </div>
    </div>
  );
}

function Row8() {
  return (
    <div className="absolute h-[35px] left-0 right-0 top-[280px]" data-name="Row">
      <Data8 />
      <div className="absolute border-[#f0f0f0] border-b border-solid h-[35px] left-[254.39px] right-0 top-0" data-name="Data" />
    </div>
  );
}

function RowData() {
  return (
    <div className="absolute h-[34px] left-0 right-[87.61px] top-[315px]" data-name="Row → Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.85)] top-[17px] whitespace-nowrap">
        <p className="leading-[22px]">新建测试用户组0476</p>
      </div>
    </div>
  );
}

function Body() {
  return (
    <div className="absolute h-[349px] left-0 right-0 top-[40px]" data-name="Body">
      <Row />
      <Row1 />
      <Row2 />
      <Row3 />
      <Row4 />
      <Row5 />
      <Row6 />
      <Row7 />
      <Row8 />
      <RowData />
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[389px] left-0 right-0 top-0" data-name="Table">
      <HeaderRow />
      <Body />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute inset-[91px_0_73px_0] overflow-auto" data-name="Container">
      <Table />
    </div>
  );
}

function Container4() {
  return (
    <div className="-translate-y-1/2 absolute h-[18px] left-[12px] top-[calc(50%-16px)] w-[49px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[12px] text-[rgba(0,0,0,0.45)] top-[9px] whitespace-nowrap">
        <p className="leading-[18px]">共 235条</p>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[24px] left-0 rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">1</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[29.31px] rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">2</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[58.62px] rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">3</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[87.93px] rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">4</p>
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[117.24px] rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">5</p>
      </div>
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[146.55px] rounded-[4px] top-1/2 w-[25.31px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%+0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">6</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="-translate-y-1/2 absolute h-[18px] left-[175.86px] top-1/2 w-[12px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[12px] text-[rgba(0,0,0,0.45)] top-[9px] whitespace-nowrap">
        <p className="leading-[18px]">...</p>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[191.86px] rounded-[4px] top-1/2 w-[25.64px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-[calc(50%-0.01px)] text-[12px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">12</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="-translate-y-1/2 absolute h-[24px] left-[114.98px] top-[calc(50%-16px)] w-[217.5px]" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
      <BackgroundBorder2 />
      <BackgroundBorder3 />
      <BackgroundBorder4 />
      <BackgroundBorder5 />
      <Container6 />
      <BackgroundBorder6 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="-translate-y-1/2 absolute left-[54px] size-[10px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g id="SVG">
          <path d="M2.5 3.75L5 6.25L7.5 3.75" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="0.833333" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[24px] left-[266px] rounded-[4px] top-[calc(50%+22px)] w-[72px]" data-name="Background+Border">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] left-[6px] text-[12px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[18px]">20条/页</p>
      </div>
      <Svg1 />
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="absolute border-[#e8e8e8] border-solid border-t h-[73px] left-0 right-0 top-[405px]" data-name="HorizontalBorder">
      <Container4 />
      <Container5 />
      <BackgroundBorder7 />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="absolute border border-[#e8e8e8] border-solid inset-[14px_431px_15px_25px] rounded-[4px]" data-name="Left Panel">
      <HorizontalBorder1 />
      <HorizontalBorder2 />
      <Container3 />
      <HorizontalBorder3 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d="M6 12L10 8L6 4" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid left-1/2 rounded-[4px] size-[32px] top-[calc(50%-20px)]" data-name="Button">
      <Svg2 />
    </div>
  );
}

function Svg3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d="M10 12L6 8L10 4" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid left-1/2 rounded-[4px] size-[32px] top-[calc(50%+20px)]" data-name="Button">
      <Svg3 />
    </div>
  );
}

function CenterTransferButtons() {
  return (
    <div className="absolute bottom-0 left-[384px] top-0 w-[32px]" data-name="Center Transfer Buttons">
      <Button1 />
      <Button2 />
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[38px] left-0 right-0 top-0" data-name="HorizontalBorder">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[14px] text-[rgba(0,0,0,0.85)] top-[18.5px] whitespace-nowrap">
        <p className="leading-[21px]">已选择用户组</p>
      </div>
    </div>
  );
}

function HorizontalBorder5() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[35px] left-0 right-0 top-[38px]" data-name="HorizontalBorder">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[12px] text-[12px] text-[rgba(0,0,0,0.45)] top-[17px] whitespace-nowrap">
        <p className="leading-[18px]">用户组</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[21px] left-1/2 top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.45)] text-center top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">暂无数据</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute inset-[73px_0_0_0]" data-name="Container">
      <Container8 />
    </div>
  );
}

function RightPanel() {
  return (
    <div className="absolute border border-[#e8e8e8] border-solid inset-[15px_24px_14px_432px] rounded-[4px]" data-name="Right Panel">
      <HorizontalBorder4 />
      <HorizontalBorder5 />
      <Container7 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[509px] overflow-auto relative shrink-0 w-full" data-name="Container">
      <LeftPanel />
      <CenterTransferButtons />
      <RightPanel />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white h-[32px] relative rounded-[4px] shrink-0" data-name="Button">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-[6px] pt-[5px] px-[17px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] text-center whitespace-nowrap">
          <p className="leading-[21px]">取消</p>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#1890ff] h-[32px] relative rounded-[4px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-[6px] pt-[5px] px-[16px] relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
          <p className="leading-[21px]">确定</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder6() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden className="absolute border-[#e8e8e8] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-end pb-[16px] pt-[17px] px-[24px] relative size-full">
          <Button3 />
          <Button4 />
        </div>
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_4px_6px_rgba(0,0,0,0.15)] flex flex-col h-[647px] items-start max-h-[720px] max-w-[1360px] relative rounded-[8px] shrink-0 w-[800px]" data-name="Background+Shadow">
      <HorizontalBorder />
      <Container2 />
      <HorizontalBorder6 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(0,0,0,0.45)] h-[740px] min-h-[200px] relative shrink-0 w-full" data-name="Overlay">
      <div className="flex flex-row justify-center min-h-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center min-h-[inherit] px-[20px] py-[40px] relative size-full">
          <BackgroundShadow />
        </div>
      </div>
    </div>
  );
}

function Modal1ShuttleTransferModal() {
  return (
    <div className="content-stretch flex flex-col h-[762px] items-start min-h-[200px] overflow-clip relative rounded-[4px] shrink-0 w-full" data-name="Modal 1: 添加到组 (Shuttle/Transfer Modal)">
      <Overlay />
    </div>
  );
}

export default function ModalShowcaseSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pt-[8px] relative size-full" data-name="Modal Showcase Section">
      <Container />
      <Modal1ShuttleTransferModal />
    </div>
  );
}