import svgPaths from "./svg-vmycg99zoa";

function Heading1PageTitle() {
  return (
    <div className="absolute h-[28px] left-[24px] right-[24px] top-[24px]" data-name="Heading 1 - Page Title">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[20px] text-[rgba(0,0,0,0.85)] top-[14px] w-[1144px]">
        <p className="leading-[28px]">新增复杂类型</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="-translate-y-1/2 absolute h-[14px] left-0 top-1/2 w-[5.45px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[#ff4d4f] text-[14px] top-[7px] whitespace-nowrap">
        <p className="leading-[14px]">*</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute h-[20px] left-0 right-[0.67px] top-0" data-name="Label">
      <Container />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[9.45px] text-[14px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[20px]">产品/服务</p>
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="-translate-y-1/2 absolute left-[541px] size-[12px] top-1/2" data-name="image">
      <svg className="absolute block inset-0 size-full" fill="none" height="12" preserveAspectRatio="none" viewBox="0 0 12 12" width="12">
        <g id="image">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, #BFBFBF)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function ImageClip() {
  return (
    <div className="absolute inset-[-1px_-0.99px_-1px_-1px] overflow-clip" data-name="image clip">
      <Image />
    </div>
  );
}

function Container1() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[11px] right-[239.67px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[327.667px]">
        <p className="leading-[22px]">请选择产品/服务</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-[0.67px] rounded-[2px] top-[28px]" data-name="Options">
      <ImageClip />
      <Container1 />
    </div>
  );
}

function Component1RequiredSelect() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="1. 产品/服务 (required, select)">
      <Label />
      <Options />
    </div>
  );
}

function Container2() {
  return (
    <div className="-translate-y-1/2 absolute h-[14px] left-0 top-1/2 w-[5.45px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[#ff4d4f] text-[14px] top-[7px] whitespace-nowrap">
        <p className="leading-[14px]">*</p>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute h-[20px] left-0 right-[0.67px] top-0" data-name="Label">
      <Container2 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[9.45px] text-[14px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[20px]">类型名称</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.25)] top-[8.5px] w-[346.667px]">
        <p className="leading-[normal]">请输入类型名称</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[0.67px] rounded-[2px] top-[28px]" data-name="Input">
      <Container3 />
    </div>
  );
}

function Component2RequiredTextInput() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="2. 类型名称 (required, text input)">
      <Label1 />
      <Input />
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute h-[20px] left-0 right-[0.67px] top-0" data-name="Label">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[20px]">类型中文描述</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.25)] top-[8.5px] w-[346.667px]">
        <p className="leading-[normal]">请输入类型中文描述</p>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[0.67px] rounded-[2px] top-[28px]" data-name="Input">
      <Container4 />
    </div>
  );
}

function Component3OptionalTextInput() {
  return (
    <div className="col-3 h-[60px] justify-self-stretch relative row-1 shrink-0" data-name="3. 类型中文描述 (optional, text input)">
      <Label2 />
      <Input1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="-translate-y-1/2 absolute h-[14px] left-0 top-1/2 w-[5.45px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[#ff4d4f] text-[14px] top-[7px] whitespace-nowrap">
        <p className="leading-[14px]">*</p>
      </div>
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute h-[20px] left-0 right-[0.67px] top-0" data-name="Label">
      <Container5 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[9.45px] text-[14px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[20px]">类型英文描述</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[18px] left-[11px] overflow-clip right-[11px] top-[7px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.25)] top-[8.5px] w-[346.667px]">
        <p className="leading-[normal]">请输入类型英文描述</p>
      </div>
    </div>
  );
}

function Input2() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 overflow-clip right-[0.67px] rounded-[2px] top-[28px]" data-name="Input">
      <Container6 />
    </div>
  );
}

function Component4RequiredTextInput() {
  return (
    <div className="col-1 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="4. 类型英文描述 (required, text input)">
      <Label3 />
      <Input2 />
    </div>
  );
}

function Container7() {
  return (
    <div className="-translate-y-1/2 absolute h-[14px] left-0 top-1/2 w-[5.45px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-0 not-italic text-[#ff4d4f] text-[14px] top-[7px] whitespace-nowrap">
        <p className="leading-[14px]">*</p>
      </div>
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute h-[20px] left-0 right-[0.67px] top-0" data-name="Label">
      <Container7 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[9.45px] text-[14px] text-[rgba(0,0,0,0.85)] top-1/2 whitespace-nowrap">
        <p className="leading-[20px]">出入参类型</p>
      </div>
    </div>
  );
}

function Image1() {
  return <div className="-translate-y-1/2 absolute left-[346.67px] size-[12px] top-1/2" data-name="image" />;
}

function ImageClip1() {
  return (
    <div className="absolute inset-[-1px] overflow-clip" data-name="image clip">
      <Image1 />
      <div className="absolute bottom-[40.63%] left-[95.81%] right-[3.14%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" height="4" preserveAspectRatio="none" viewBox="0 0 7 4" width="7">
            <path d="M0.5 0.5L3.5 3.5L6.5 0.5" id="Vector" stroke="var(--stroke-0, #BFBFBF)" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[10.67px] right-[258px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] w-[327.667px]">
        <p className="leading-[22px]">请选择</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="absolute bg-white border border-[#d9d9d9] border-solid h-[32px] left-0 right-[0.67px] rounded-[2px] top-[28px]" data-name="Options">
      <ImageClip1 />
      <Container8 />
    </div>
  );
}

function Component5RequiredSelect() {
  return (
    <div className="col-2 h-[60px] justify-self-stretch relative row-2 shrink-0" data-name="5. 出入参类型 (required, select)">
      <Label4 />
      <Options1 />
    </div>
  );
}

function FormFieldsSection() {
  return (
    <div className="absolute gap-x-[16px] gap-y-[24px] grid grid-cols-[repeat(3,minmax(0,1fr))] grid-rows-[__60px_60px] left-[24px] pt-[9px] right-[24px] top-[67px]" data-name="Form Fields Section">
      <Component1RequiredSelect />
      <Component2RequiredTextInput />
      <Component3OptionalTextInput />
      <Component4RequiredTextInput />
      <Component5RequiredSelect />
    </div>
  );
}

function Heading2SectionTitle() {
  return (
    <div className="absolute h-[33px] left-[24px] right-[24px] top-[235px]" data-name="Heading 2 - Section Title">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[16px] text-[rgba(0,0,0,0.85)] top-[21px] w-[1144px]">
        <p className="leading-[24px]">参数内容</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-31px)] size-[24px] top-1/2" data-name="SVG">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <g id="SVG">
          <path d="M5 12H19" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 5V19" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[32px] left-[calc(50%+15px)] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-[16px] whitespace-nowrap">
        <p className="leading-[32px]">添加参数</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[34px] left-0 rounded-[4px] top-0 w-[120px]" data-name="Button">
      <Svg />
      <Container9 />
    </div>
  );
}

function AddParameterButton() {
  return (
    <div className="absolute h-[35px] left-[24px] right-[24px] top-[283px]" data-name="Add Parameter Button">
      <Button />
    </div>
  );
}

function Cell() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] leading-[0] left-[-0.01px] overflow-clip right-[970.71px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center left-[16px] not-italic text-[#ff4d4f] top-[27px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center left-[25.45px] text-[rgba(0,0,0,0.85)] top-[27px]">
        <p className="leading-[22px]">参数名称</p>
      </div>
    </div>
  );
}

function Cell1() {
  return (
    <div className="absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] left-[171.29px] overflow-clip right-[856.51px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[27px] whitespace-nowrap">
        <p className="leading-[22px]">是否必填</p>
      </div>
    </div>
  );
}

function Cell2() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] leading-[0] left-[285.48px] overflow-clip right-[742.33px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center left-[16px] not-italic text-[#ff4d4f] top-[27px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center left-[25.46px] text-[rgba(0,0,0,0.85)] top-[27px]">
        <p className="leading-[22px]">类型</p>
      </div>
    </div>
  );
}

function Cell3() {
  return (
    <div className="absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] left-[399.67px] overflow-clip right-[605.29px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[27px] whitespace-nowrap">
        <p className="leading-[22px]">数组类型</p>
      </div>
    </div>
  );
}

function Cell4() {
  return (
    <div className="absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] left-[536.7px] overflow-clip right-[456.85px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center leading-[0] left-[16px] not-italic text-[14px] text-[rgba(0,0,0,0.85)] top-[27px] whitespace-nowrap">
        <p className="leading-[22px]">是否允许NULL</p>
      </div>
    </div>
  );
}

function Cell5() {
  return (
    <div className="[word-break:break-word] absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] leading-[0] left-[685.15px] overflow-clip right-[274.13px] text-[14px] top-0 whitespace-nowrap" data-name="Cell">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Liberation_Sans:Regular',sans-serif] justify-center left-[16px] not-italic text-[#ff4d4f] top-[27px]">
        <p className="leading-[22px]">*</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center left-[25.45px] text-[rgba(0,0,0,0.85)] top-[27px]">
        <p className="leading-[22px]">中文描述</p>
      </div>
    </div>
  );
}

function Cell6() {
  return (
    <div className="absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] left-[867.88px] overflow-clip right-[91.41px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[27px] whitespace-nowrap">
        <p className="leading-[22px]">英文描述</p>
      </div>
    </div>
  );
}

function Cell7() {
  return (
    <div className="absolute bg-[#fafafa] border-[#e8e8e8] border-b border-solid h-[55px] left-[1050.59px] overflow-clip right-[-0.01px] top-0" data-name="Cell">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[27px] whitespace-nowrap">
        <p className="leading-[22px]">操作</p>
      </div>
    </div>
  );
}

function HeaderRow() {
  return (
    <div className="absolute h-[55px] left-0 right-0 top-0" data-name="Header → Row">
      <Cell />
      <Cell1 />
      <Cell2 />
      <Cell3 />
      <Cell4 />
      <Cell5 />
      <Cell6 />
      <Cell7 />
    </div>
  );
}

function BodyRowData() {
  return (
    <div className="absolute h-[118px] left-0 right-0 top-[55px]" data-name="Body → Row → Data">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-[16px] text-[14px] text-[rgba(0,0,0,0.85)] top-[59px] w-[1110px]">
        <p className="leading-[22px]">暂无数据</p>
      </div>
    </div>
  );
}

function Table() {
  return (
    <div className="absolute h-[173px] left-0 overflow-auto right-0 top-px" data-name="Table">
      <HeaderRow />
      <BodyRowData />
    </div>
  );
}

function ParameterContentTable() {
  return (
    <div className="absolute border border-[#f0f0f0] border-solid h-[176px] left-[24px] overflow-clip right-[24px] rounded-[2px] top-[333px]" data-name="Parameter Content Table">
      <Table />
    </div>
  );
}

function Button1() {
  return (
    <div className="-translate-y-1/2 absolute bg-[#1890ff] border border-[#1890ff] border-solid h-[34px] left-0 rounded-[4px] top-[calc(50%+4.5px)] w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-center text-white top-1/2 whitespace-nowrap">
        <p className="leading-[32px]">保存</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="-translate-y-1/2 absolute bg-white border border-[#d9d9d9] border-solid h-[34px] left-[70px] rounded-[4px] top-[calc(50%+4.5px)] w-[62px]" data-name="Button">
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-1/2 text-[14px] text-[rgba(0,0,0,0.85)] text-center top-1/2 whitespace-nowrap">
        <p className="leading-[32px]">取消</p>
      </div>
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="absolute h-[41px] left-[24px] right-[24px] top-[524px]" data-name="Action Buttons">
      <Button1 />
      <Button2 />
    </div>
  );
}

function SectionFormCard() {
  return (
    <div className="absolute bg-white drop-shadow-[0px_2px_4px_rgba(0,0,0,0.06)] h-[589px] left-[24px] right-[24px] rounded-[8px] top-[62px]" data-name="Section - Form Card">
      <Heading1PageTitle />
      <FormFieldsSection />
      <Heading2SectionTitle />
      <AddParameterButton />
      <ParameterContentTable />
      <ActionButtons />
    </div>
  );
}

function Container10() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[24px] top-[calc(50%-399px)] w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(0,0,0,0.85)] top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">新增复杂类型</p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="absolute bg-[#f0f2f5] inset-[48px_0_0_0] overflow-auto" data-name="Content">
      <SectionFormCard />
      <Container10 />
    </div>
  );
}

function MainArea() {
  return (
    <div className="absolute h-[900px] left-[200px] right-0 top-0" data-name="Main Area">
      <Content />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute h-[900px] left-0 overflow-clip right-0 top-0" data-name="Main">
      <MainArea />
    </div>
  );
}

function Svg1() {
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

function Container11() {
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
      <Svg1 />
      <Container11 />
    </div>
  );
}

function Svg2() {
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

function Container12() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[46px] overflow-clip right-[36px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[118px]">
        <p className="leading-[40px]">云API管理</p>
      </div>
    </div>
  );
}

function Svg3() {
  return <div className="-translate-y-1/2 absolute left-[174px] size-[10px] top-1/2" data-name="SVG" />;
}

function ParentapiExpanded() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Parent: 云API管理 (expanded)">
      <Svg2 />
      <Container12 />
      <Svg3 />
    </div>
  );
}

function Svg4() {
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

function Container15() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[43px] top-1/2 w-[42px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">运营端</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Container">
      <Svg4 />
      <Container15 />
      <div className="absolute inset-[45%_9.04%_46.38%_88%]" data-name="Vector">
        <svg className="absolute block inset-0 size-full" fill="none" height="3.44727" preserveAspectRatio="none" viewBox="0 0 5.92773 3.44727" width="5.92773">
          <path d={svgPaths.p3a6c8980} fill="var(--fill-0, white)" fillOpacity="0.65" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Svg5() {
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

function Container17() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口管理</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[40px]" data-name="Container">
      <Svg5 />
      <Container17 />
    </div>
  );
}

function Svg6() {
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

function Container19() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口分类管理</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[80px]" data-name="Container">
      <Svg6 />
      <Container19 />
    </div>
  );
}

function Svg7() {
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

function Container21() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[112px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">复杂类型参数管理</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[120px]" data-name="Container">
      <Svg7 />
      <Container21 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute h-[200px] left-0 right-0 top-[40px]" data-name="Container">
      <Container14 />
      <Container16 />
      <Container18 />
      <Container20 />
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

function Container23() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口分类管理</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[276px]" data-name="Container">
      <Svg8 />
      <Container23 />
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

function Container25() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[119px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">复杂类型参数管理</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[316px]" data-name="Container">
      <Svg9 />
      <Container25 />
    </div>
  );
}

function Svg10() {
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

function Container26() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[46px] overflow-clip right-[36px] top-1/2" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Scada:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] w-[118px]" style={{ fontVariationSettings: '"wght" 400' }}>
        <p className="leading-[40px]">租户端</p>
      </div>
    </div>
  );
}

function Svg11() {
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
      <Svg10 />
      <Container26 />
      <Svg11 />
    </div>
  );
}

function Svg12() {
  return <div className="-translate-y-1/2 absolute left-[20px] size-[16px] top-1/2" data-name="SVG" />;
}

function Svg13() {
  return <div className="-translate-y-1/2 absolute left-[174px] size-[10px] top-1/2" data-name="SVG" />;
}

function Svg14() {
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

function Container29() {
  return (
    <div className="-translate-y-1/2 absolute h-[40px] left-[70px] top-1/2 w-[56px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-[rgba(255,255,255,0.65)] top-[20px] whitespace-nowrap">
        <p className="leading-[40px]">接口管理</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-0" data-name="Container">
      <Svg14 />
      <Container29 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-[40px] left-0 right-0 top-[240px]" data-name="Container">
      <Svg12 />
      <Svg13 />
      <Container28 />
    </div>
  );
}

function Svg15() {
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

function Container30() {
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
    <div className="absolute bg-[#1890ff] h-[40px] left-[-2px] right-[2px] top-[356px]" data-name="Background">
      <Svg15 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return <div className="-translate-y-1/2 absolute h-[40px] left-[70px] right-[12px] top-[calc(50%-6px)]" data-name="Container" />;
}

function Nav() {
  return (
    <div className="absolute inset-[48px_0_0_0] overflow-x-clip overflow-y-auto" data-name="Nav">
      <ParentapiExpanded />
      <Container13 />
      <Container22 />
      <Container24 />
      <OtherParentItemsCollapsed />
      <Container27 />
      <Background1 />
      <Container31 />
    </div>
  );
}

function AsideSidebar() {
  return (
    <div className="absolute bg-[#001529] h-[900px] left-0 overflow-clip top-0 w-[200px]" data-name="Aside - SIDEBAR">
      <Background />
      <Nav />
    </div>
  );
}

function Container33() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[22px] top-1/2 w-[84px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Medium','Noto_Sans_SC:Medium',sans-serif] font-medium justify-center leading-[0] left-0 text-[14px] text-white top-[11px] whitespace-nowrap">
        <p className="leading-[22px]">总览</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[-9px] top-[calc(50%+4px)] w-[106px]" data-name="Container">
      <Container33 />
    </div>
  );
}

function Container35() {
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

function Container34() {
  return (
    <div className="-translate-y-1/2 absolute h-[22px] left-[66px] top-[calc(50%+4.5px)] w-[106px]" data-name="Container">
      <Container35 />
    </div>
  );
}

function Svg16() {
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

function Container37() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[22px] top-1/2 w-[80.97px]" data-name="Container">
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Monda:Regular',sans-serif] font-normal justify-center leading-[0] left-0 text-[14px] text-white top-[10.5px] whitespace-nowrap">
        <p className="leading-[21px]">59385296.zh</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="-translate-y-1/2 absolute h-[21px] left-[1704px] top-[calc(50%+3px)] w-[102.97px]" data-name="Container">
      <Svg16 />
      <Container37 />
    </div>
  );
}

function HeaderBar() {
  return (
    <div className="absolute bg-[#002140] border-[#e8e8e8] border-b border-solid h-[48px] left-[200px] right-0 top-0" data-name="Header Bar">
      <Container32 />
      <Container34 />
      <Container36 />
      <div className="absolute inset-[calc(50%+0.5px)_0.84%_calc(42.82%-0.57px)_98.81%]" data-name="Vector">
        <div className="absolute inset-[0_9.04%_0_0]">
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
    <div className="relative size-full" style={{ backgroundImage: "linear-gradient(90deg, rgb(240, 242, 245) 0%, rgb(240, 242, 245) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }} data-name="云API管理-租户端-新增复杂类型">
      <Main />
      <AsideSidebar />
      <HeaderBar />
    </div>
  );
}