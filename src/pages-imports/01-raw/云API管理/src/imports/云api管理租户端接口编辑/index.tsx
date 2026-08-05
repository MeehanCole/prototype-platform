import svgPaths from "./svg-u67975ncc";

function PageTitle() {
  return (
    <div className="absolute h-[28px] left-[24px] right-[24px] top-[24px]" data-name="Page Title">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[20px] text-[rgba(0,0,0,0.85)] top-[14px] w-[1192px]">
        <p className="leading-[28px]">编辑接口</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">基本信息</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">产品/服务</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-auto right-[8px] top-[6px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[546px]">
        <p className="leading-[normal]">服务：云API管理</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-[#f5f5f5] border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container6 />
    </div>
  );
}

function Container4() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container5 />
      <Input />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">接口名称</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[16px] left-[8px] overflow-auto right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">test-20241220</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container9 />
    </div>
  );
}

function Container7() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container8 />
      <Input1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">接口中文名</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-auto right-[8px] top-[6px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">测试</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container10 />
    </div>
  );
}

function Component3Required() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="3. 接口中文名 (required)">
      <Paragraph />
      <Input2 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">接口中文描述</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-auto right-[8px] top-[6px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">测试</p>
      </div>
    </div>
  );
}

function Input3() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container13 />
    </div>
  );
}

function Container11() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Container12 />
      <Input3 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">接口英文描述</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[16px] left-[8px] overflow-auto right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">test</p>
      </div>
    </div>
  );
}

function Input4() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container14 />
    </div>
  );
}

function Component5Required() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-3 shrink-0" data-name="5. 接口英文描述 (required)">
      <Paragraph1 />
      <Input4 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">版本</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-[16px] left-[8px] overflow-auto right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">v1.0</p>
      </div>
    </div>
  );
}

function Input5() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container15 />
    </div>
  );
}

function Component6Required() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-3 shrink-0" data-name="6. 版本 (required)">
      <Paragraph2 />
      <Input5 />
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">基础运营接口版本号</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[546px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input6() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container18 />
    </div>
  );
}

function Container16() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-4 shrink-0" data-name="Container">
      <Container17 />
      <Input6 />
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">接口转发类型</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[8px] right-[32px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[522px]">
        <p className="leading-[22px]">统一运营</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[2px] top-0" data-name="Options">
      <Container22 />
    </div>
  );
}

function Svg() {
  return (
    <div className="absolute left-0 size-[12px] top-0" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="SVG">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute bottom-[31.25%] right-[8px] top-[31.25%] w-[12px]" data-name="Container">
      <Svg />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Options />
      <Container23 />
    </div>
  );
}

function Container19() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-4 shrink-0" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">是否接口</p>
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="-translate-y-1/2 absolute border border-[#1890ff] border-solid left-0 rounded-[8px] size-[16px] top-1/2" data-name="Border">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1890ff] left-1/2 rounded-[4px] size-[8px] top-1/2" data-name="Background" />
    </div>
  );
}

function Label() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-0 top-1/2 w-[34.729px]" data-name="Label">
      <Border />
      <div className="-translate-y-1/2 absolute h-[13.275px] left-[22px] top-1/2 w-[12.729px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" height="13.2754" preserveAspectRatio="none" viewBox="0 0 12.7285 13.2754" width="12.7285">
          <path d={svgPaths.p175ef1e0} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-[50.73px] top-1/2 w-[35.439px]" data-name="Label">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 35.4395 16" width="35.4395">
        <g id="Label">
          <rect height="15" id="Border" rx="7.5" stroke="var(--stroke-0, #D9D9D9)" width="15" x="0.5" y="0.5" />
          <path d={svgPaths.p347bb040} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[16px] left-0 right-0 top-[28px]" data-name="Container">
      <Label />
      <Label1 />
    </div>
  );
}

function Component9RequiredSelected() {
  return (
    <div className="col-1 h-[44px] justify-self-stretch relative row-5 shrink-0" data-name="9. 是否接口 (required, 是 selected)">
      <Paragraph3 />
      <Container24 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">查询接口</p>
      </div>
    </div>
  );
}

function Border1() {
  return (
    <div className="-translate-y-1/2 absolute border border-[#1890ff] border-solid left-0 rounded-[8px] size-[16px] top-1/2" data-name="Border">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1890ff] left-1/2 rounded-[4px] size-[8px] top-1/2" data-name="Background" />
    </div>
  );
}

function Label2() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-0 top-1/2 w-[34.729px]" data-name="Label">
      <Border1 />
      <div className="-translate-y-1/2 absolute h-[13.275px] left-[22px] top-1/2 w-[12.729px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" height="13.2754" preserveAspectRatio="none" viewBox="0 0 12.7285 13.2754" width="12.7285">
          <path d={svgPaths.p175ef1e0} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Label3() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-[50.73px] top-1/2 w-[35.439px]" data-name="Label">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 35.4395 16" width="35.4395">
        <g id="Label">
          <rect height="15" id="Border" rx="7.5" stroke="var(--stroke-0, #D9D9D9)" width="15" x="0.5" y="0.5" />
          <path d={svgPaths.p347bb040} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[16px] left-0 right-0 top-[28px]" data-name="Container">
      <Label2 />
      <Label3 />
    </div>
  );
}

function Component10RequiredSelected() {
  return (
    <div className="col-2 h-[44px] justify-self-stretch relative row-5 shrink-0" data-name="10. 查询接口 (required, 是 selected)">
      <Paragraph4 />
      <Container25 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="[word-break:break-word] absolute h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">是否云API</p>
      </div>
    </div>
  );
}

function Border2() {
  return (
    <div className="-translate-y-1/2 absolute border border-[#1890ff] border-solid left-0 rounded-[8px] size-[16px] top-1/2" data-name="Border">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1890ff] left-1/2 rounded-[4px] size-[8px] top-1/2" data-name="Background" />
    </div>
  );
}

function Label4() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-0 top-1/2 w-[34.729px]" data-name="Label">
      <Border2 />
      <div className="-translate-y-1/2 absolute h-[13.275px] left-[22px] top-1/2 w-[12.729px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" height="13.2754" preserveAspectRatio="none" viewBox="0 0 12.7285 13.2754" width="12.7285">
          <path d={svgPaths.p175ef1e0} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Label5() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-[50.73px] top-1/2 w-[35.439px]" data-name="Label">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 35.4395 16" width="35.4395">
        <g id="Label">
          <rect height="15" id="Border" rx="7.5" stroke="var(--stroke-0, #D9D9D9)" width="15" x="0.5" y="0.5" />
          <path d={svgPaths.p347bb040} fill="var(--fill-0, black)" fillOpacity="0.85" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute h-[16px] left-0 right-0 top-[28px]" data-name="Container">
      <Label4 />
      <Label5 />
    </div>
  );
}

function Component11apiRequiredSelected() {
  return (
    <div className="col-1 h-[54px] justify-self-stretch relative row-6 shrink-0" data-name="11. 是否云API (required, 是 selected)">
      <Paragraph5 />
      <Container26 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="[word-break:break-word] absolute font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[20px] leading-[0] left-0 not-italic right-0 text-[14px] top-0 whitespace-nowrap" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-0 text-[#ff4d4f] top-[10px]">
        <p className="leading-[20px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[7.45px] text-[rgba(0,0,0,0.85)] top-[10px]">
        <p className="leading-[20px]">请求方式</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[8px] right-[32px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[522px]">
        <p className="leading-[22px]">POST</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[2px] top-0" data-name="Options">
      <Container28 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="absolute left-0 size-[12px] top-0" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="SVG">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" />
        </g>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute bottom-[31.25%] right-[8px] top-[31.25%] w-[12px]" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Options1 />
      <Container29 />
    </div>
  );
}

function Component12Required() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-6 shrink-0" data-name="12. 请求方式 (required)">
      <Paragraph6 />
      <Container27 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute gap-x-[16px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[______60px_60px_60px_60px_50px_60px] left-[24px] right-[24px] top-[62px]" data-name="Container">
      <Container4 />
      <Container7 />
      <Component3Required />
      <Container11 />
      <Component5Required />
      <Component6Required />
      <Container16 />
      <Container19 />
      <Component9RequiredSelected />
      <Component10RequiredSelected />
      <Component11apiRequiredSelected />
      <Component12Required />
    </div>
  );
}

function Section1BasicInfoForm() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[556px] left-[24px] right-[24px] rounded-[8px] top-[68px]" data-name="Section 1: Basic Info Form">
      <Container2 />
      <Container3 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">入参</p>
      </div>
    </div>
  );
}

function Cell() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[-0.01px] right-[986.49px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">参数名称</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[155.51px] right-[830.96px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">是否必填</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[311.04px] not-italic right-[711.76px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">类型</p>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[430.23px] right-[556.25px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">数组类型</p>
      </div>
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[585.76px] right-[337.46px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">是否允许NULL</p>
      </div>
    </div>
  );
}

function Cell5() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[804.54px] not-italic right-[168.77px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">中文描述</p>
      </div>
    </div>
  );
}

function Cell6() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[973.23px] not-italic right-[-0.01px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">英文描述</p>
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
    </div>
  );
}

function BodyRowData() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[87px] left-0 right-0 top-[48px]" data-name="Body → Row → Data">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[43px] whitespace-nowrap">
        <p className="leading-[22px]">暂无数据</p>
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[135px] left-0 right-0 top-0" data-name="Table">
      <HeaderRow />
      <BodyRowData />
    </div>
  );
}

function Border3() {
  return (
    <div className="absolute border border-[#f0f0f0] border-solid h-[137px] left-[24px] overflow-clip right-[24px] rounded-[2px] top-[62px]" data-name="Border">
      <Table />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] left-[24px] rounded-[4px] top-[215px] w-[102.08px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">+ 添加参数</p>
      </div>
    </div>
  );
}

function Section2InputParameters() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[271px] left-[24px] right-[24px] rounded-[8px] top-[640px]" data-name="Section 2: Input Parameters">
      <Container30 />
      <Border3 />
      <Button />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">系统公共参数</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-0 top-1/2 w-[1144px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">placementId</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-0" data-name="Container">
      <Container34 />
    </div>
  );
}

function Container36() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-0 top-1/2 w-[1144px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">uopUin</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-[30px]" data-name="Container">
      <Container36 />
    </div>
  );
}

function Container38() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[12px] top-1/2" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="Container">
          <path d={svgPaths.p37c1480} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] border border-[#1890ff] border-solid left-0 rounded-[2px] size-[16px] top-1/2" data-name="Background+Border">
      <Container38 />
    </div>
  );
}

function Container39() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[24px] top-1/2 w-[75.63px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">pkc-envId</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute h-[22px] left-0 right-0 top-[60px]" data-name="Container">
      <BackgroundBorder />
      <Container39 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[82px] left-[24px] right-[24px] top-[62px]" data-name="Container">
      <Container33 />
      <Container35 />
      <Container37 />
    </div>
  );
}

function Section3SystemPublicParams() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[168px] left-[24px] right-[24px] rounded-[8px] top-[927px]" data-name="Section 3: System Public Params">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">出参</p>
      </div>
    </div>
  );
}

function Cell7() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[-0.01px] right-[986.49px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">参数名称</p>
      </div>
    </div>
  );
}

function Cell8() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[155.51px] right-[830.96px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">是否必填</p>
      </div>
    </div>
  );
}

function Cell9() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[311.04px] not-italic right-[711.76px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">类型</p>
      </div>
    </div>
  );
}

function Cell10() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[430.23px] right-[556.25px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">数组类型</p>
      </div>
    </div>
  );
}

function Cell11() {
  return (
    <div className="absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid h-[48px] left-[585.76px] right-[337.46px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[23.75px] whitespace-nowrap">
        <p className="leading-[22px]">是否允许NULL</p>
      </div>
    </div>
  );
}

function Cell12() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[804.54px] not-italic right-[168.77px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">中文描述</p>
      </div>
    </div>
  );
}

function Cell13() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#f0f0f0] border-b border-solid font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[48px] leading-[0] left-[973.23px] not-italic right-[-0.01px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[16px] text-[#ff4d4f] top-[23.75px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col justify-center left-[23.45px] text-[rgba(0,0,0,0.85)] top-[23.75px]">
        <p className="leading-[22px]">英文描述</p>
      </div>
    </div>
  );
}

function HeaderRow1() {
  return (
    <div className="absolute h-[48px] left-0 right-0 top-0" data-name="Header → Row">
      <Cell7 />
      <Cell8 />
      <Cell9 />
      <Cell10 />
      <Cell11 />
      <Cell12 />
      <Cell13 />
    </div>
  );
}

function BodyRowData1() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[87px] left-0 right-0 top-[48px]" data-name="Body → Row → Data">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.85)] text-center top-[43px] whitespace-nowrap">
        <p className="leading-[22px]">暂无数据</p>
      </div>
    </div>
  );
}

function Table1() {
  return (
    <div className="absolute h-[135px] left-0 right-0 top-0" data-name="Table">
      <HeaderRow1 />
      <BodyRowData1 />
    </div>
  );
}

function Border4() {
  return (
    <div className="absolute border border-[#f0f0f0] border-solid h-[137px] left-[24px] overflow-clip right-[24px] rounded-[2px] top-[62px]" data-name="Border">
      <Table1 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] left-[24px] rounded-[4px] top-[215px] w-[102.08px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">+ 添加出参</p>
      </div>
    </div>
  );
}

function Section4OutputParameters() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[271px] left-[24px] right-[24px] rounded-[8px] top-[1111px]" data-name="Section 4: Output Parameters">
      <Container40 />
      <Border4 />
      <Button1 />
    </div>
  );
}

function Container41() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">错误码定义</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[50.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">S01003</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[74.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（无效参数）</p>
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-0" data-name="HorizontalBorder">
      <Container42 />
      <Container43 />
    </div>
  );
}

function Container44() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[50.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">S01111</p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[74.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（内部错误）</p>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[39px]" data-name="HorizontalBorder">
      <Container44 />
      <Container45 />
    </div>
  );
}

function Container46() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[33.61px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">erwq</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[57.61px] top-1/2 w-[51.36px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（234）</p>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[78px]" data-name="HorizontalBorder">
      <Container46 />
      <Container47 />
    </div>
  );
}

function Container48() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[33.61px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">ettt</p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[57.61px] top-1/2 w-[43.56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（tttt）</p>
      </div>
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[117px]" data-name="HorizontalBorder">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container50() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[84.02px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">IdNotFound</p>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[108.02px] top-1/2 w-[108.91px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（未找到对应id）</p>
      </div>
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[156px]" data-name="HorizontalBorder">
      <Container50 />
      <Container51 />
    </div>
  );
}

function Container52() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[50.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">number</p>
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[74.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（数字错误）</p>
      </div>
    </div>
  );
}

function HorizontalBorder5() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[195px]" data-name="HorizontalBorder">
      <Container52 />
      <Container53 />
    </div>
  );
}

function Container54() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[126.03px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">DryRunOperation</p>
      </div>
    </div>
  );
}

function HorizontalBorder6() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[234px]" data-name="HorizontalBorder">
      <Container54 />
    </div>
  );
}

function Container55() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[126.03px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">FailedOperation</p>
      </div>
    </div>
  );
}

function HorizontalBorder7() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[273px]" data-name="HorizontalBorder">
      <Container55 />
    </div>
  );
}

function Container56() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[109.22px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">InternalError</p>
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[133.22px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（内部错误）</p>
      </div>
    </div>
  );
}

function HorizontalBorder8() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[312px]" data-name="HorizontalBorder">
      <Container56 />
      <Container57 />
    </div>
  );
}

function Container58() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[134.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">InvalidParameter</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[158.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（无效参数）</p>
      </div>
    </div>
  );
}

function HorizontalBorder9() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[351px]" data-name="HorizontalBorder">
      <Container58 />
      <Container59 />
    </div>
  );
}

function Container60() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[176.44px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">InvalidParameterValue</p>
      </div>
    </div>
  );
}

function HorizontalBorder10() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[390px]" data-name="HorizontalBorder">
      <Container60 />
    </div>
  );
}

function Container61() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[109.22px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">LimitExceeded</p>
      </div>
    </div>
  );
}

function HorizontalBorder11() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[429px]" data-name="HorizontalBorder">
      <Container61 />
    </div>
  );
}

function Container62() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[134.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">MissingParameter</p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[158.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（无效参数）</p>
      </div>
    </div>
  );
}

function HorizontalBorder12() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[468px]" data-name="HorizontalBorder">
      <Container62 />
      <Container63 />
    </div>
  );
}

function Container64() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[168.03px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">ResourceInsufficient</p>
      </div>
    </div>
  );
}

function HorizontalBorder13() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[507px]" data-name="HorizontalBorder">
      <Container64 />
    </div>
  );
}

function Container65() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[109.22px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">ResourceInUse</p>
      </div>
    </div>
  );
}

function HorizontalBorder14() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[546px]" data-name="HorizontalBorder">
      <Container65 />
    </div>
  );
}

function Container66() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[134.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">ResourceNotFound</p>
      </div>
    </div>
  );
}

function HorizontalBorder15() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[585px]" data-name="HorizontalBorder">
      <Container66 />
    </div>
  );
}

function Container67() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[159.64px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">ResourceUnavailable</p>
      </div>
    </div>
  );
}

function HorizontalBorder16() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[624px]" data-name="HorizontalBorder">
      <Container67 />
    </div>
  );
}

function Container68() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[176.44px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">UnauthorizedOperation</p>
      </div>
    </div>
  );
}

function HorizontalBorder17() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[663px]" data-name="HorizontalBorder">
      <Container68 />
    </div>
  );
}

function Container69() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[134.42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">UnknownParameter</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[158.42px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">（未知参数）</p>
      </div>
    </div>
  );
}

function HorizontalBorder18() {
  return (
    <div className="absolute border-[#f0f0f0] border-b border-solid h-[39px] left-0 right-0 top-[702px]" data-name="HorizontalBorder">
      <Container69 />
      <Container70 />
    </div>
  );
}

function Container72() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[16px] top-1/2 w-[168.03px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Mono:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">UnsupportedOperation</p>
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="absolute h-[38px] left-0 right-0 top-[741px]" data-name="Container">
      <Container72 />
    </div>
  );
}

function Border5() {
  return (
    <div className="absolute border border-[#f0f0f0] border-solid h-[300px] left-[24px] overflow-auto right-[24px] rounded-[2px] top-[62px]" data-name="Border">
      <HorizontalBorder />
      <HorizontalBorder1 />
      <HorizontalBorder2 />
      <HorizontalBorder3 />
      <HorizontalBorder4 />
      <HorizontalBorder5 />
      <HorizontalBorder6 />
      <HorizontalBorder7 />
      <HorizontalBorder8 />
      <HorizontalBorder9 />
      <HorizontalBorder10 />
      <HorizontalBorder11 />
      <HorizontalBorder12 />
      <HorizontalBorder13 />
      <HorizontalBorder14 />
      <HorizontalBorder15 />
      <HorizontalBorder16 />
      <HorizontalBorder17 />
      <HorizontalBorder18 />
      <Container71 />
    </div>
  );
}

function Section5ErrorCodeList() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[386px] left-[24px] right-[24px] rounded-[8px] top-[1398px]" data-name="Section 5: Error Code List">
      <Container41 />
      <Border5 />
    </div>
  );
}

function Container73() {
  return (
    <div className="absolute h-[22px] left-[24px] right-[24px] top-[24px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[16px] text-[rgba(0,0,0,0.85)] top-[11px] w-[1144px]">
        <p className="leading-[22px]">路由配置</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] left-[16px] rounded-[4px] top-1/2 w-[130.08px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">+ 新建编码路由</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="absolute bottom-0 right-0 top-0 w-[162.08px]" data-name="Container">
      <Button2 />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute bottom-0 right-0 top-0 w-[824.002px]" data-name="Margin">
      <Container74 />
    </div>
  );
}

function Container75() {
  return (
    <div className="absolute bottom-0 left-0 top-0 w-[116px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[#1890ff] text-[14px] top-[19px] whitespace-nowrap">
        <p className="leading-[22px]">一级编码路由</p>
      </div>
      <div className="absolute bg-[#1890ff] bottom-[-1px] h-[2px] left-0 right-0" data-name="Horizontal Divider" />
    </div>
  );
}

function Container76() {
  return (
    <div className="absolute bottom-0 left-[116px] top-0 w-[116px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[19px] whitespace-nowrap">
        <p className="leading-[22px]">二级编码路由</p>
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="absolute bottom-0 left-[232px] top-0 w-[88px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[19px] whitespace-nowrap">
        <p className="leading-[22px]">流控详情</p>
      </div>
    </div>
  );
}

function HorizontalBorder19() {
  return (
    <div className="absolute border-[#e8e8e8] border-b border-solid h-[39px] left-[24px] right-[24px] top-[62px]" data-name="HorizontalBorder">
      <Margin />
      <Container75 />
      <Container76 />
      <Container77 />
    </div>
  );
}

function Container80() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">路由</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="absolute h-[16px] left-[8px] overflow-auto right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[546px]">
        <p className="leading-[normal]">yun004</p>
      </div>
    </div>
  );
}

function Input7() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container81 />
    </div>
  );
}

function Container79() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container80 />
      <Input7 />
    </div>
  );
}

function Container83() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">后端地址</p>
      </div>
    </div>
  );
}

function Container85() {
  return (
    <div className="absolute h-[16px] left-[8px] overflow-auto right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[441.92px]">
        <p className="leading-[normal]">{`http://top-api.core.test26042500`}</p>
      </div>
    </div>
  );
}

function Input8() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[104.08px] rounded-[2px] top-1/2" data-name="Input">
      <Container85 />
    </div>
  );
}

function Container86() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[467.92px] top-1/2 w-[96.08px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[#1890ff] text-[14px] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">+ 新建后端地址</p>
      </div>
    </div>
  );
}

function Container84() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Input8 />
      <Container86 />
    </div>
  );
}

function Container82() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container83 />
      <Container84 />
    </div>
  );
}

function Container88() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">接口周期</p>
      </div>
    </div>
  );
}

function Container90() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[497.11px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input9() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[48.89px] rounded-bl-[2px] rounded-tl-[2px] top-1/2" data-name="Input">
      <Container90 />
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#fafafa] border-[#d9d9d9] border-b border-r border-solid border-t h-[32px] left-[515.11px] rounded-br-[2px] rounded-tr-[2px] top-1/2 w-[48.89px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.45)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">次/秒</p>
      </div>
    </div>
  );
}

function Container89() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Input9 />
      <BackgroundBorder1 />
    </div>
  );
}

function Container87() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Container88 />
      <Container89 />
    </div>
  );
}

function Container92() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">账号周期</p>
      </div>
    </div>
  );
}

function Container94() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[497.11px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input10() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[48.89px] rounded-bl-[2px] rounded-tl-[2px] top-1/2" data-name="Input">
      <Container94 />
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#fafafa] border-[#d9d9d9] border-b border-r border-solid border-t h-[32px] left-[515.11px] rounded-br-[2px] rounded-tr-[2px] top-1/2 w-[48.89px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.45)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">次/秒</p>
      </div>
    </div>
  );
}

function Container93() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Input10 />
      <BackgroundBorder2 />
    </div>
  );
}

function Container91() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Container92 />
      <Container93 />
    </div>
  );
}

function Container96() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">账号周期白名单</p>
      </div>
    </div>
  );
}

function Container97() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[546px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input11() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container97 />
    </div>
  );
}

function Container95() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-3 shrink-0" data-name="Container">
      <Container96 />
      <Input11 />
    </div>
  );
}

function Container99() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">签名和鉴权</p>
      </div>
    </div>
  );
}

function Container101() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[8px] right-[32px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[522px]">
        <p className="leading-[22px]">只签名不鉴权</p>
      </div>
    </div>
  );
}

function Options2() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-0 rounded-[2px] top-0" data-name="Options">
      <Container101 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="absolute left-0 size-[12px] top-0" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="SVG">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45" />
        </g>
      </svg>
    </div>
  );
}

function Container102() {
  return (
    <div className="absolute bottom-[31.25%] right-[8px] top-[31.25%] w-[12px]" data-name="Container">
      <Svg2 />
    </div>
  );
}

function Container100() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Options2 />
      <Container102 />
    </div>
  );
}

function Container98() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-3 shrink-0" data-name="Container">
      <Container99 />
      <Container100 />
    </div>
  );
}

function Container103() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">接口调用timeout值</p>
      </div>
    </div>
  );
}

function Container107() {
  return (
    <div className="absolute h-[16px] left-0 overflow-auto right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[8px] w-[495.33px]">
        <p className="leading-[normal]">5000</p>
      </div>
    </div>
  );
}

function Container106() {
  return (
    <div className="-translate-y-1/2 absolute h-[16px] left-0 right-[15px] top-1/2" data-name="Container">
      <Container107 />
    </div>
  );
}

function RectangleAlignStretch() {
  return (
    <div className="absolute bottom-0 left-[495.33px] top-0 w-[15px]" data-name="Rectangle:align-stretch">
      <div className="absolute bottom-0 left-0 opacity-0 top-0 w-[15px]" data-name="Rectangle" />
    </div>
  );
}

function Container105() {
  return (
    <div className="absolute h-[16px] left-[8px] right-[8px] top-[7px]" data-name="Container">
      <Container106 />
      <RectangleAlignStretch />
    </div>
  );
}

function Input12() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[35.67px] rounded-bl-[2px] rounded-tl-[2px] top-1/2" data-name="Input">
      <Container105 />
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#fafafa] border-[#d9d9d9] border-b border-r border-solid border-t h-[32px] left-[528.33px] rounded-br-[2px] rounded-tr-[2px] top-1/2 w-[35.67px]" data-name="Background+Border">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.45)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">ms</p>
      </div>
    </div>
  );
}

function Container104() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Input12 />
      <BackgroundBorder3 />
    </div>
  );
}

function Component7timeout() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-4 shrink-0" data-name="7. 接口调用timeout">
      <Container103 />
      <Container104 />
    </div>
  );
}

function Container109() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">呼入系统</p>
      </div>
    </div>
  );
}

function Container110() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[546px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input13() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container110 />
    </div>
  );
}

function Container108() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-4 shrink-0" data-name="Container">
      <Container109 />
      <Input13 />
    </div>
  );
}

function Container112() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">负责人</p>
      </div>
    </div>
  );
}

function Container113() {
  return (
    <div className="absolute h-[18px] left-[8px] overflow-clip right-[8px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.45)] top-[8px] w-[546px]">
        <p className="leading-[normal]">请输入</p>
      </div>
    </div>
  );
}

function Input14() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-0 rounded-[2px] top-[28px]" data-name="Input">
      <Container113 />
    </div>
  );
}

function Container111() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-5 shrink-0" data-name="Container">
      <Container112 />
      <Input14 />
    </div>
  );
}

function Container115() {
  return (
    <div className="absolute h-[20px] left-0 right-0 top-0" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[10px] w-[564px]">
        <p className="leading-[20px]">变更记录</p>
      </div>
    </div>
  );
}

function Container117() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-0 top-1/2 w-[564px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-0 not-italic text-[#1890ff] text-[14px] top-[11px] w-[564px]">
        <p className="leading-[22px]">查看</p>
      </div>
    </div>
  );
}

function Container116() {
  return (
    <div className="absolute h-[32px] left-0 right-0 top-[28px]" data-name="Container">
      <Container117 />
    </div>
  );
}

function Container114() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-5 shrink-0" data-name="Container">
      <Container115 />
      <Container116 />
    </div>
  );
}

function Container78() {
  return (
    <div className="absolute gap-x-[16px] gap-y-[24px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[_____60px_60px_60px_60px_60px] left-[24px] pt-[8px] right-[24px] top-[117px]" data-name="Container">
      <Container79 />
      <Container82 />
      <Container87 />
      <Container91 />
      <Container95 />
      <Container98 />
      <Component7timeout />
      <Container108 />
      <Container111 />
      <Container114 />
    </div>
  );
}

function Section6RoutingConfig() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[545px] left-[24px] right-[24px] rounded-[8px] top-[1800px]" data-name="Section 6: Routing Config">
      <Container73 />
      <HorizontalBorder19 />
      <Container78 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] right-[140px] rounded-[4px] top-[16px] w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">保存</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[32px] right-[70px] rounded-[4px] top-[16px] w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">发布</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] right-0 rounded-[4px] top-[16px] w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] left-1/2 not-italic text-[14px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[22px]">取消</p>
      </div>
    </div>
  );
}

function Section7ActionButtons() {
  return (
    <div className="absolute h-[64px] left-[24px] right-[24px] top-[2361px]" data-name="Section 7: Action Buttons">
      <Button3 />
      <Button4 />
      <Button5 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[2449px] left-0 right-0 top-0" data-name="Container">
      <PageTitle />
      <Section1BasicInfoForm />
      <Section2InputParameters />
      <Section3SystemPublicParams />
      <Section4OutputParameters />
      <Section5ErrorCodeList />
      <Section6RoutingConfig />
      <Section7ActionButtons />
    </div>
  );
}

function ContentScroll() {
  return (
    <div className="absolute inset-[48px_0_0_0]" data-name="Content Scroll">
      <Container1 />
    </div>
  );
}

function MainArea() {
  return (
    <div className="absolute h-[2498px] left-[200px] right-0 top-0" data-name="Main Area">
      <ContentScroll />
    </div>
  );
}

function Svg3() {
  return (
    <div className="-translate-y-1/2 absolute left-[20px] size-[20px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="20" preserveAspectRatio="none" viewBox="0 0 20 20" width="20">
        <g id="SVG">
          <path d={svgPaths.p10fb8600} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container118() {
  return (
    <div className="-translate-y-1/2 absolute h-[48px] left-[48px] overflow-clip top-1/2 w-[96px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[16px] text-white top-[24px] whitespace-nowrap">
        <p className="leading-[48px]">统一运营平台</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-[#002140] h-[48px] left-0 right-0 top-0" data-name="Background">
      <Svg3 />
      <Container118 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="-translate-y-1/2 absolute left-[20px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p862d7d0} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container119() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[46px] overflow-clip right-[36px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[118px]">
        <p className="leading-[40px]">云API管理</p>
      </div>
    </div>
  );
}

function Svg5() {
  return <div className="-translate-y-1/2 absolute left-[174px] size-[10px] top-1/2" data-name="SVG" />;
}

function ParentapiExpanded() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Parent: 云API管理 (expanded)">
      <Svg4 />
      <Container119 />
      <Svg5 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="-translate-y-1/2 absolute left-[18px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p23b04380} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container122() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[43px] top-1/2 w-[42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">运营端</p>
      </div>
    </div>
  );
}

function Container121() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Container">
      <Svg6 />
      <Container122 />
      <div className="absolute inset-[45%_9.04%_46.38%_88%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="3.44727" preserveAspectRatio="none" viewBox="0 0 5.92773 3.44727" width="5.92773">
          <path d={svgPaths.p3a6c8980} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Svg7() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p1a2d1b68} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container124() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口管理</p>
      </div>
    </div>
  );
}

function Container123() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[40px]" data-name="Container">
      <Svg7 />
      <Container124 />
    </div>
  );
}

function Svg8() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p34f949a0} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container126() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口分类管理</p>
      </div>
    </div>
  );
}

function Container125() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[80px]" data-name="Container">
      <Svg8 />
      <Container126 />
    </div>
  );
}

function Svg9() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p18c1de80} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container128() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[112px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">复杂类型参数管理</p>
      </div>
    </div>
  );
}

function Container127() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[120px]" data-name="Container">
      <Svg9 />
      <Container128 />
    </div>
  );
}

function Container120() {
  return (
    <div className="absolute h-[200px] left-0 right-0 top-[40px]" data-name="Container">
      <Container121 />
      <Container123 />
      <Container125 />
      <Container127 />
    </div>
  );
}

function Svg10() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p34f949a0} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container130() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口分类管理</p>
      </div>
    </div>
  );
}

function Container129() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[276px]" data-name="Container">
      <Svg10 />
      <Container130 />
    </div>
  );
}

function Svg11() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p18c1de80} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container132() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[119px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">复杂类型参数管理</p>
      </div>
    </div>
  );
}

function Container131() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[316px]" data-name="Container">
      <Svg11 />
      <Container132 />
    </div>
  );
}

function Svg12() {
  return (
    <div className="-translate-y-1/2 absolute left-[20px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p23b04380} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container133() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[46px] overflow-clip right-[36px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Scada:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[118px]" style={{ fontVariationSettings: '"wght" 400' }}>
        <p className="leading-[40px]">租户端</p>
      </div>
    </div>
  );
}

function Svg13() {
  return (
    <div className="-translate-y-1/2 absolute left-[174px] size-[10px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="10" preserveAspectRatio="none" viewBox="0 0 10 10" width="10">
        <g id="SVG">
          <path d={svgPaths.p28f60340} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function OtherParentItemsCollapsed() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[200px]" data-name="Other parent items (collapsed)">
      <Svg12 />
      <Container133 />
      <Svg13 />
    </div>
  );
}

function Svg14() {
  return <div className="-translate-y-1/2 absolute left-[20px] size-[16px] top-1/2" data-name="SVG" />;
}

function Svg15() {
  return <div className="-translate-y-1/2 absolute left-[174px] size-[10px] top-1/2" data-name="SVG" />;
}

function Svg16() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p1a2d1b68} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container136() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口管理</p>
      </div>
    </div>
  );
}

function Container135() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Container">
      <Svg16 />
      <Container136 />
    </div>
  );
}

function Container134() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[240px]" data-name="Container">
      <Svg14 />
      <Svg15 />
      <Container135 />
    </div>
  );
}

function Svg17() {
  return (
    <div className="-translate-y-1/2 absolute left-[44px] size-[16px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="16" preserveAspectRatio="none" viewBox="0 0 16 16" width="16">
        <g id="SVG">
          <path d={svgPaths.p1e64dc80} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container137() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-white top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">同步记录管理</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bg-[#1890ff] h-[40px] left-[-2px] right-[2px] top-[357px]" data-name="Background">
      <Svg17 />
      <Container137 />
    </div>
  );
}

function Container138() {
  return <div className="-translate-y-1/2 absolute h-[40px] left-[70px] right-[12px] top-[calc(50%-5.5px)]" data-name="Container" />;
}

function Nav() {
  return (
    <div className="absolute inset-[48px_0_0_0] overflow-x-clip overflow-y-auto" data-name="Nav">
      <ParentapiExpanded />
      <Container120 />
      <Container129 />
      <Container131 />
      <OtherParentItemsCollapsed />
      <Container134 />
      <Background1 />
      <Container138 />
    </div>
  );
}

function AsideSidebar() {
  return (
    <div className="absolute bg-[#001529] h-[973px] left-0 overflow-clip top-0 w-[200px]" data-name="Aside - SIDEBAR">
      <Background />
      <Nav />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[2498px] left-0 right-0 top-0" data-name="Container">
      <MainArea />
      <AsideSidebar />
    </div>
  );
}

function Container140() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[22px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-white top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">总览</p>
      </div>
    </div>
  );
}

function Container139() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[-9px] top-[calc(50%+4px)] w-[106px]" data-name="Container">
      <Container140 />
    </div>
  );
}

function Container142() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[22px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-white top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">平台运营</p>
      </div>
      <div className="absolute flex inset-[43.42%_16.67%_40.91%_76.28%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[100cqh] rotate-180 w-[100cqw]">
          <div className="relative size-full" data-name="Vector">
            <svg className="absolute block inset-0 size-full" fill="none" height="3.44727" preserveAspectRatio="none" viewBox="0 0 5.92773 3.44727" width="5.92773">
              <path d={svgPaths.p3a6c8980} fill="var(--fill-0, white)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container141() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[66px] top-[calc(50%+4.5px)] w-[106px]" data-name="Container">
      <Container142 />
    </div>
  );
}

function Svg18() {
  return (
    <div className="-translate-y-1/2 absolute left-0 size-[14px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="14" preserveAspectRatio="none" viewBox="0 0 14 14" width="14">
        <g id="SVG">
          <path d={svgPaths.p2bc97680} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container144() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[22px] top-1/2 w-[80.97px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">59385296.zh</p>
      </div>
    </div>
  );
}

function Container143() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[1089px] top-1/2 w-[102.97px]" data-name="Container">
      <Svg18 />
      <Container144 />
    </div>
  );
}

function HeaderBar() {
  return (
    <div className="absolute bg-[#002140] border-[#e8e8e8] border-b border-solid h-[48px] left-[200px] right-0 top-0" data-name="Header Bar">
      <Container139 />
      <Container141 />
      <Container143 />
      <div className="absolute inset-[calc(50%+0.5px)_0.84%_calc(42.82%-0.57px)_98.81%]" data-name="Vector">
        <div className="absolute inset-[0_-35.56%_0_0]">
          <svg className="block size-full" fill="none" height="3.44727" preserveAspectRatio="none" viewBox="0 0 5.92773 3.44727" width="5.92773">
            <path d={svgPaths.p3a6c8980} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function api() {
  return (
    <div className="relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(240, 242, 245) 0%, rgb(240, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="云API管理-租户端-接口编辑">
      <Container />
      <HeaderBar />
    </div>
  );
}