import { Breadcrumb, Button, Card, Collapse, Form, Input, InputNumber, Layout, Space, Tag, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./App.css";
import {
  Block,
  BlockValue,
  BuiltInExpressionType,
  Direction,
  Expression,
  ExpressionType,
  HeaderSegment,
  HeaderSegmentType,
  Property,
} from "./Model";
import { ReactNode } from "react";
import { blocks } from "./StandardLibrary";
import {
  changeScope,
  createScope,
  evaluateAst,
  resolveBlock,
  resolveProperty,
  Scope,
  transpileMainBlock,
} from "./Evaluator";
import { addProperty, blockEntity, changePropertyValue, deleteProperty } from "./EditorModel";

const { Search } = Input;
const { Header, Sider, Content } = Layout;

function MainHeader() {
  return (
    <Header>
      <Breadcrumb>
        <Breadcrumb.Item>BMI Calculator</Breadcrumb.Item>
      </Breadcrumb>
    </Header>
  );
}

function BlockButton({ block }: { block: Block }) {
  return <Button>{block.name}</Button>;
}

function Palette() {
  return (
    <Pane title="Palette">
      <Search placeholder="Search" />
      <Button>Number</Button>
      {blocks.map((block) => (
        <BlockButton block={block} key={block.id} />
      ))}
    </Pane>
  );
}

function Data() {
  const properties = blockEntity.use((it) => it.properties);
  let addPropertyButton = (
    <Form.Item>
      <Button type="dashed" block icon={<PlusOutlined />} onClick={() => addProperty(properties.length)}>
        Add property
      </Button>
    </Form.Item>
  );
  return (
    <Pane title="Data">
      <Form>
        {properties.map((property, index) => (
          <PropertyEditor property={property} index={index} key={property.id} />
        ))}
        {addPropertyButton}
      </Form>
    </Pane>
  );
}

function LeftSidebar() {
  return (
    <Sider width={250}>
      <Palette />
      <Data />
    </Sider>
  );
}

function Box({ children, direction }: { children: ReactNode; direction?: Direction }) {
  return (
    <Space
      direction={direction}
      align={"center"}
      style={{
        border: "1px solid lightgray",
        borderRadius: "5px",
        padding: "5px",
      }}
    >
      {children}
    </Space>
  );
}

function StructureBlock() {
  const block = blockEntity.use();
  return <StructureExpression expression={block.value} scope={createScope(block)} />;
}

function StructureExpression({ expression, scope }: { expression: BlockValue; scope: Scope }) {
  switch (expression.type) {
    case BuiltInExpressionType.BinaryOperatorCall:
      return <>built-in binary operator call</>;
    case BuiltInExpressionType.FunctionCall:
      return <>built-in function call</>;
    case ExpressionType.NumberLiteral:
      return <Tag>{expression.value}</Tag>;
    case ExpressionType.PropertyReference:
      const property = resolveProperty(scope, expression.propertyId);
      if (property) {
        return <Tag>{property.name}</Tag>;
      } else {
        throw new Error(`Property "${expression.propertyId}" not found`);
      }
    case ExpressionType.BlockReference:
      const block = resolveBlock(scope, expression.blockId);
      if (block) {
        const newScope = changeScope(scope, expression.propertyOverrides);
        return (
          <Box direction={block.header.direction}>
            {block.header.segments.map((segment, index) => (
              <StructureHeaderSegment segment={segment} scope={newScope} key={index} />
            ))}
          </Box>
        );
      } else {
        throw new Error(`Block "${expression.blockId}" not found`);
      }
  }
}

function StructureHeaderSegment({ segment, scope }: { segment: HeaderSegment; scope: Scope }) {
  switch (segment.type) {
    case HeaderSegmentType.TextSegment:
      return <>{segment.text}</>;
    case HeaderSegmentType.PropertySegment:
      const property = resolveProperty(scope, segment.propertyId);
      if (property) {
        return <StructureExpression expression={property.value} scope={scope} />;
      } else {
        throw new Error(`Property "${segment.propertyId}" not found`);
      }
  }
}

function Structure() {
  return (
    <Pane title="Structure">
      <StructureBlock />
    </Pane>
  );
}

function toNumber(expression: Expression) {
  switch (expression.type) {
    case ExpressionType.NumberLiteral:
      return expression.value;
    default:
      return 0;
  }
}

function PropertyEditor({ property, index, readOnly }: { property: Property; index: number; readOnly?: boolean }) {
  return (
    <Form.Item label={property.name}>
      <InputNumber value={toNumber(property.value)} onChange={(value) => changePropertyValue(index, value)} />
      {!readOnly && (
        <Tooltip title={"Delete"}>
          <Button shape="circle" icon={<DeleteOutlined />} onClick={() => deleteProperty(index)} />
        </Tooltip>
      )}
    </Form.Item>
  );
}

function Pane(props: { title: ReactNode; children: ReactNode }) {
  return (
    <Card title={props.title} size={"small"} type={"inner"}>
      {props.children}
    </Card>
  );
}

function Inspector() {
  return (
    <Pane title="Inspector">
      <Form />
    </Pane>
  );
}

function RightSidebar() {
  return (
    <Sider width={350}>
      <Collapse>
        <Structure />
        <Inspector />
      </Collapse>
    </Sider>
  );
}

function Result() {
  const result = blockEntity.use((it) => evaluateAst(transpileMainBlock(it)));
  return <Content>{result}</Content>;
}

function App() {
  return (
    <Layout>
      <MainHeader />
      <Layout>
        <LeftSidebar />
        <Result />
        <RightSidebar />
      </Layout>
    </Layout>
  );
}

export default App;
