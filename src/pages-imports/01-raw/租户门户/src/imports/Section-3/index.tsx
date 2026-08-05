function Container() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[4px] not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] w-[1188px]">
        <p className="leading-[22px]">开启确认弹窗</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[24px] top-1/2 w-[32px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">开启</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="-translate-y-1/2 absolute left-[4px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d="M12 4L4 12" id="Vector" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.33333" />
          <path d="M4 4L12 12" id="Vector_2" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="-translate-y-1/2 absolute left-[372px] rounded-[4px] size-[24px] top-1/2" data-name="Button">
      <Svg />
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[57px] left-0 right-0 top-0" data-name="HorizontalBorder">
      <Container1 />
      <Button />
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#faad14] left-0 rounded-[11px] size-[22px] top-0" data-name="Background">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Bold',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[14px]">!</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[22px] left-[30px] right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[342px]">
        <p className="leading-[22px]">开启后,UASS认证将作为非控制台登录控制的唯一方式</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[81px]" data-name="Container">
      <Background />
      <Container3 />
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] right-[94px] rounded-[4px] top-1/2 w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.65)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">取消</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] right-[24px] rounded-[4px] top-1/2 w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">确定</p>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute border-[#e8e8e8] border-solid border-t h-[65px] left-0 right-0 top-[127px]" data-name="HorizontalBorder">
      <Button1 />
      <Button2 />
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="-translate-x-1/2 absolute bg-white drop-shadow-[0px_4px_6px_rgba(0,0,0,0.15)] h-[192px] left-1/2 rounded-[8px] top-[48px] w-[420px]" data-name="Background+Shadow">
      <HorizontalBorder />
      <Container2 />
      <HorizontalBorder1 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(0,0,0,0.45)] h-[288px] left-0 right-0 rounded-[8px] top-[34px]" data-name="Overlay">
      <BackgroundShadow />
    </div>
  );
}

export default function Section() {
  return (
    <div className="relative size-full" data-name="Section">
      <Container />
      <Overlay />
    </div>
  );
}