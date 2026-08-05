function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(0,0,0,0.85)] whitespace-nowrap">
          <p className="leading-[24px]">编辑账号</p>
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

function ModalHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="Modal Header">
      <div aria-hidden className="absolute border-[#f0f0f0] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[17px] pt-[16px] px-[24px] relative size-full">
          <Container />
          <Svg />
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">功能区</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full">
        <p className="leading-[32px]">测试区</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container2 />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">实例</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full">
        <p className="leading-[32px]">平台测试信创内蒙云实例</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label1 />
      <Container4 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">地域</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full">
        <p className="leading-[32px]">内蒙</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Container6 />
    </div>
  );
}

function Label3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">账号</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full">
        <p className="leading-[32px]">uopsub.zh1</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <Container8 />
    </div>
  );
}

function Label4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">账号类型</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.85)] w-full">
        <p className="leading-[32px]">子账号</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label4 />
      <Container10 />
    </div>
  );
}

function Label5() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Monda:Regular',sans-serif] font-normal gap-[2px] items-start leading-[0] relative shrink-0 text-[14px] w-[80px] whitespace-nowrap" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 text-[#ff4d4f]">
        <p className="leading-[32px]">*</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[rgba(0,0,0,0.65)]">
        <p className="leading-[32px]">SecretId</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white flex-[1_0_0] h-[32px] min-w-px relative rounded-[4px]" data-name="Input">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label5 />
      <Input />
    </div>
  );
}

function Label6() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Monda:Regular',sans-serif] font-normal gap-[2px] items-start leading-[0] relative shrink-0 text-[14px] w-[80px] whitespace-nowrap" data-name="Label">
      <div className="flex flex-col justify-center relative shrink-0 text-[#ff4d4f]">
        <p className="leading-[32px]">*</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[rgba(0,0,0,0.65)]">
        <p className="leading-[32px]">SecretKey</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white flex-[1_0_0] h-[32px] min-w-px relative rounded-[4px]" data-name="Input">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label6 />
      <Input1 />
    </div>
  );
}

function Label7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[80px]" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(0,0,0,0.65)] whitespace-nowrap">
        <p className="leading-[32px]">描述</p>
      </div>
    </div>
  );
}

function Textarea() {
  return (
    <div className="bg-white flex-[1_0_0] h-[84px] min-h-[80px] min-w-px relative rounded-[4px]" data-name="Textarea">
      <div aria-hidden className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Container">
      <Label7 />
      <Textarea />
    </div>
  );
}

function ModalBody() {
  return (
    <div className="relative shrink-0 w-full" data-name="Modal Body">
      <div className="overflow-auto rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
          <Container1 />
          <Container3 />
          <Container5 />
          <Container7 />
          <Container9 />
          <Container11 />
          <Container12 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function Button() {
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

function Button1() {
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

function ModalFooter() {
  return (
    <div className="relative shrink-0 w-full" data-name="Modal Footer">
      <div aria-hidden className="absolute border-[#f0f0f0] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-end pb-[16px] pt-[17px] px-[24px] relative size-full">
          <Button />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_4px_6px_rgba(0,0,0,0.15)] flex flex-col items-start relative rounded-[8px] size-full" data-name="编辑账号">
      <ModalHeader />
      <ModalBody />
      <ModalFooter />
    </div>
  );
}