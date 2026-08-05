function Container() {
  return (
    <div className="-translate-y-1/2 absolute h-[24px] left-[24px] top-1/2 w-[80px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[16px] text-[rgba(0,0,0,0.85)] top-[12px] whitespace-nowrap">
        <p className="leading-[24px]">添加子账号</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="-translate-y-1/2 absolute left-[458px] size-[18px] top-1/2" data-name="SVG">
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
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[57px] left-0 right-0 top-0" data-name="HorizontalBorder">
      <Container />
      <Svg />
    </div>
  );
}

function Label() {
  return (
    <div className="[word-break:break-word] absolute h-[22px] leading-[0] left-0 right-0 text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[9px] text-[rgba(0,0,0,0.85)] top-[11px]">
        <p className="leading-[22px]">账号名称</p>
      </div>
    </div>
  );
}

function Input() {
  return <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Input" />;
}

function Container3() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-0" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[452px]">
        <p className="leading-[22px]">昵称</p>
      </div>
    </div>
  );
}

function Input1() {
  return <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Input" />;
}

function Container4() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[86px]" data-name="Container">
      <Label1 />
      <Input1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="[word-break:break-word] absolute h-[22px] leading-[0] left-0 right-0 text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[9px] text-[rgba(0,0,0,0.85)] top-[11px]">
        <p className="leading-[22px]">手机号码</p>
      </div>
    </div>
  );
}

function Input2() {
  return <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Input" />;
}

function Container5() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[172px]" data-name="Container">
      <Label2 />
      <Input2 />
    </div>
  );
}

function Label3() {
  return (
    <div className="[word-break:break-word] absolute h-[22px] leading-[0] left-0 right-0 text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[9px] text-[rgba(0,0,0,0.85)] top-[11px]">
        <p className="leading-[22px]">安全邮箱</p>
      </div>
    </div>
  );
}

function Input3() {
  return <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Input" />;
}

function Container6() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[258px]" data-name="Container">
      <Label3 />
      <Input3 />
    </div>
  );
}

function Label4() {
  return (
    <div className="[word-break:break-word] absolute font-normal h-[22px] leading-[0] left-0 right-0 text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] justify-center left-[9px] text-[rgba(0,0,0,0.85)] top-[11px]">
        <p className="leading-[22px]">UASS账号</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[25px] left-[11px] overflow-clip right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[11.5px] w-[428px]">
        <p className="leading-[normal]">请输入UASS账号</p>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[4px] top-[30px]" data-name="Input">
      <Container8 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[344px]" data-name="Container">
      <Label4 />
      <Input4 />
    </div>
  );
}

function Label5() {
  return (
    <div className="[word-break:break-word] absolute h-[22px] leading-[0] left-0 right-0 text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center left-[9px] text-[rgba(0,0,0,0.85)] top-[11px]">
        <p className="leading-[22px]">员工号</p>
      </div>
    </div>
  );
}

function Input5() {
  return <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Input" />;
}

function Container9() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[430px]" data-name="Container">
      <Label5 />
      <Input5 />
    </div>
  );
}

function Label6() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[452px]">
        <p className="leading-[22px]">用户组</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[11px] top-1/2 w-[42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.45)] top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">请选择</p>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="-translate-y-1/2 absolute left-[425px] size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d="M3.5 5.25L7 8.75L10.5 5.25" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[4px] top-[30px]" data-name="Background+Border">
      <Container11 />
      <Svg1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[62px] left-0 right-0 top-[516px]" data-name="Container">
      <Label6 />
      <BackgroundBorder />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[578px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
      <Container7 />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[452px]">
        <p className="leading-[22px]">控制台密码</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid left-0 rounded-[8px] size-[16px] top-[3px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-white left-1/2 rounded-[3px] size-[6px] top-1/2" data-name="Background" />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute h-[19px] left-0 top-0 w-[16px]" data-name="Margin">
      <BackgroundBorder1 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">自动生成密码</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="-translate-y-1/2 absolute h-[20px] left-0 top-1/2 w-[132px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[12px] text-[rgba(0,0,0,0.45)] top-[10px] whitespace-nowrap">
        <p className="leading-[20px]">请点击按钮生成随机密码</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[140px] top-1/2 w-[28px]" data-name="Link">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[#1890ff] text-[14px] top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">生成</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[21px] left-0 right-0 top-[26px]" data-name="Container">
      <Container19 />
      <Link />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute h-[47px] left-[24px] top-0 w-[168px]" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[47px] left-0 right-0 top-0" data-name="Container">
      <Margin />
      <Container16 />
    </div>
  );
}

function Margin1() {
  return (
    <div className="absolute h-[19px] left-0 top-0 w-[16px]" data-name="Margin">
      <div className="absolute bg-white border border-[#d9d9d9] border-solid left-0 rounded-[8px] size-[16px] top-[3px]" data-name="Background+Border" />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-[63px]" data-name="Container">
      <Margin1 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[24px] text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">自定义密码</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[85px] left-0 right-0 top-[30px]" data-name="Container">
      <Container15 />
      <Container20 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[115px] left-[24px] right-[24px] top-[632px]" data-name="Container">
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[790px] left-[6px] overflow-auto right-[2px] top-[57px]" data-name="Container">
      <Container2 />
      <Container12 />
    </div>
  );
}

function Button() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] right-[92px] rounded-[4px] top-1/2 w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[calc(50%-0.5px)] whitespace-nowrap">
        <p className="leading-[21px]">取消</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] h-[32px] right-[24px] rounded-[4px] top-1/2 w-[60px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[calc(50%-0.5px)] whitespace-nowrap">
        <p className="leading-[21px]">确定</p>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute border-[#e8e8e8] border-solid border-t h-[65px] left-[3px] right-[-3px] top-[847px]" data-name="HorizontalBorder">
      <Button />
      <Button1 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="-translate-x-1/2 absolute bg-white drop-shadow-[0px_4px_6px_rgba(0,0,0,0.15)] h-[920px] left-[calc(50%+9px)] rounded-[8px] top-[77px] w-[524px]" data-name="Background+Shadow">
      <HorizontalBorder />
      <Container1 />
      <HorizontalBorder1 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="bg-[rgba(0,0,0,0.45)] h-[1229px] min-h-[200px] relative shrink-0 w-full" data-name="Overlay">
      <BackgroundShadow />
    </div>
  );
}

export default function Modal() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip pt-[8px] relative rounded-[4px] size-full" data-name="Modal 3">
      <Overlay />
    </div>
  );
}