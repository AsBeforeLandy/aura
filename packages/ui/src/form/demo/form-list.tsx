import React from "react";
import { Form, Input, Button, Space } from "@aura/ui";

const Demo: React.FC = () => (
    <Form
        layout="horizontal"
        colon
        initialValues={{
            users: [{ name: "张三", email: "zhangsan@example.com" }],
        }}
        size="sm"
        onFinish={(values) => console.log("提交：", values)}
    >
        <Form.Item
            name="title"
            label="表单标题"
            rules={[{ required: true, message: "请输入标题" }]}
        >
            <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.List name="users" compact>
            {(fields, { add, remove }) => (
                <>
                    {fields.map((field, index) => (
                        <div
                            key={field.key}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            <Form.Item
                                name={`users[${index}].name`}
                                label={`用户 ${index + 1}`}
                                rules={[
                                    { required: true, message: "请输入姓名" },
                                ]}
                            >
                                <Input placeholder="姓名" />
                            </Form.Item>

                            <Form.Item name={`users[${index}].email`}>
                                <Input placeholder="邮箱" />
                            </Form.Item>

                            <button
                                type="button"
                                onClick={() => remove(index)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--aura-text-tertiary)",
                                    cursor: "pointer",
                                    fontSize: 18,
                                    lineHeight: 1,
                                    padding: 4,
                                    flexShrink: 0,
                                }}
                                aria-label="删除"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="aura-form-list-add"
                        onClick={() => add()}
                    >
                        + 添加用户
                    </button>
                </>
            )}
        </Form.List>

        <Form.Item>
            <Space>
                <Button type="submit" variant="primary">
                    提交
                </Button>
                <Button>取消</Button>
            </Space>
        </Form.Item>
    </Form>
);

export default Demo;
