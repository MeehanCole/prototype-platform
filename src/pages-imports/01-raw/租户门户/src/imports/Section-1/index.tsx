import svgPaths from "./svg-yl3gvyhc3e";

function Container() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] w-[1188px]">
        <p className="leading-[22px]">新建策略弹窗</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">新建策略</p>
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

function Label() {
  return (
    <div className="[word-break:break-word] absolute contents leading-[0] left-0 not-italic text-[14px] top-0 whitespace-nowrap" data-name="Label">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center left-0 text-[#ff4d4f] top-[11px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center left-0 text-[rgba(0,0,0,0.65)] top-[11px]">
        <p className="leading-[22px]">策略名</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[346px]">
        <p className="leading-[normal]">请输入策略名</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Input">
      <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 rounded-[4px] top-0 w-[372px]" data-name="Input Background" />
      <Container4 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.65)] top-[11px] w-[372px]">
        <p className="leading-[22px]">备注</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[346px]">
        <p className="leading-[normal]">请输入备注</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Input">
      <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 rounded-[4px] top-0 w-[372px]" data-name="Input Background" />
      <Container6 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <Label1 />
      <Input1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Container">
      <Container3 />
      <Container5 />
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
      <div className="absolute bg-white h-[318px] left-0 rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] top-0 w-[420px]" data-name="Background+Shadow Background" />
      <HorizontalBorder />
      <Container2 />
      <HorizontalBorder1 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute contents left-0 top-0" data-name="Overlay">
      <div className="absolute bg-[rgba(0,0,0,0.45)] h-[414px] left-0 rounded-[8px] top-0 w-[1192px]" data-name="Overlay Background" />
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