import svgPaths from "./svg-2vdsfhlwam";

function Container() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] w-[1188px]">
        <p className="leading-[22px]">新建密钥确认弹窗</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">新建密钥</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute left-0 size-[8px] top-0" data-name="SVG">
      <div className="absolute inset-[-8.33%]">
        <svg className="block size-full" fill="none" height="9.33333" preserveAspectRatio="none" viewBox="0 0 9.33333 9.33333" width="9.33333">
          <g id="SVG">
            <path d={svgPaths.p48af40} id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.33333" />
            <path d={svgPaths.p30908200} id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.33333" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Button">
      <div className="absolute left-0 rounded-[4px] size-[24px] top-0" data-name="Button Background" />
      <Svg />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute contents left-0 top-0" data-name="HorizontalBorder">
      <div className="absolute border-[#e8e8e8] border-b border-solid h-[57px] left-0 top-0 w-[420px]" data-name="HorizontalBorder Background" />
      <Container1 />
      <Button />
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute left-0 size-[11.667px] top-0" data-name="SVG">
      <div className="absolute inset-[-5%]">
        <svg className="block size-full" fill="none" height="12.8333" preserveAspectRatio="none" viewBox="0 0 12.8333 12.8333" width="12.8333">
          <g id="SVG">
            <path d={svgPaths.p335b6880} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
            <path d="M6.41665 8.74967V6.41634" id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
            <path d="M6.41665 4.08333H6.42248" id="Vector_3" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Background">
      <div className="absolute bg-[#faad14] left-0 rounded-[11px] size-[22px] top-0" data-name="Background Background" />
      <Svg1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">您正在为 [admin] 创建密钥</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <Background />
      <Container3 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Button">
      <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 rounded-[4px] top-0 w-[62px]" data-name="Button Background" />
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.65)] text-center top-0 whitespace-nowrap">
        <p className="leading-[22px]">取消</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Button">
      <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] left-0 rounded-[4px] top-0 w-[62px]" data-name="Button Background" />
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-center text-white top-0 whitespace-nowrap">
        <p className="leading-[22px]">确定</p>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="HorizontalBorder">
      <div className="absolute border-[#e8e8e8] border-solid border-t h-[65px] left-0 top-0 w-[420px]" data-name="HorizontalBorder Background" />
      <Button1 />
      <Button2 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Background+Shadow">
      <div className="absolute bg-white h-[192px] left-0 rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] top-0 w-[420px]" data-name="Background+Shadow Background" />
      <HorizontalBorder />
      <Container2 />
      <HorizontalBorder1 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Overlay">
      <div className="absolute bg-[rgba(0,0,0,0.45)] h-[288px] left-0 rounded-[8px] top-0 w-[1192px]" data-name="Overlay Background" />
      <BackgroundShadow />
    </div>
  );
}

export default function Section() {
  return (
    <div className="contents relative size-full" data-name="Section">
      <Container />
      <Overlay />
    </div>
  );
}