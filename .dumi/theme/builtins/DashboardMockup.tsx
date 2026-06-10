import React, { useState } from 'react';
import {
  Card,
  Button,
  Avatar,
  Tag,
  Badge,
  Select,
  Switch,
  message,
  Flex,
  Typography,
  Input
} from '@aura/ui';

export default function DashboardMockup() {
  const [dbSource, setDbSource] = useState('production');
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('优化列表页面的渲染性能');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    if (!aiPrompt.trim()) {
      message.error('请输入 AI 指令');
      return;
    }
    setIsDeploying(true);
    message.loading('AI 编码助手正在执行指令并编译部署...', 2000);

    setTimeout(() => {
      setIsDeploying(false);
      message.success('AI 部署任务已完成！页面响应时间缩短 35%');
    }, 2000);
  };

  return (
    <div style={{ margin: '40px auto 60px', maxWidth: '960px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Typography.Title level={2} style={{ marginBottom: '8px' }}>
          实时交互体验中心
        </Typography.Title>
        <Typography.Paragraph style={{ color: 'var(--aura-text-secondary)', fontSize: '15px' }}>
          无需配置，在这里直接感受 Aura 组件的现代设计感、状态联动以及极佳的视觉表现力。
        </Typography.Paragraph>
      </div>

      <Card
        variant={glowEnabled ? 'glass' : 'elevated'}
        hoverable
        style={{
          padding: '24px',
          background: 'var(--aura-bg)',
          borderRadius: '16px',
          border: '1px solid var(--aura-border)',
          transition: 'all 0.4s ease',
          boxShadow: glowEnabled ? 'var(--aura-shadow-glow)' : 'var(--aura-shadow-lg)'
        }}
      >
        <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--aura-border)', paddingBottom: '16px' }}>
          <Flex align="center" gap="md">
            <Avatar size="lg" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', fontWeight: 'bold' }}>
              AI
            </Avatar>
            <div>
              <Typography.Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Aura AI 控制中心
              </Typography.Title>
              <Typography.Text variant="secondary" style={{ fontSize: '13px' }}>
                项目状态：
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                  <Badge dot variant="success" />
                  <span>运行中</span>
                </span>
              </Typography.Text>
            </div>
          </Flex>
          <Flex align="center" gap="sm">
            <Tag variant="primary">v0.0.1</Tag>
            <Tag variant="success">React 18</Tag>
          </Flex>
        </Card.Header>

        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* 卡片 1 */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--aura-bg-secondary)', border: '1px solid var(--aura-border)' }}>
              <Typography.Text variant="secondary" style={{ fontSize: '13px' }}>数据源切换</Typography.Text>
              <div style={{ marginTop: '12px' }}>
                <Select
                  value={dbSource}
                  onChange={(val) => {
                    setDbSource(val as string);
                    message.info(`已切换至数据源: ${val === 'production' ? '云端生产库' : '本地 Mock 数据'}`);
                  }}
                  options={[
                    { label: '云端生产库 (AWS-Oregon)', value: 'production' },
                    { label: '本地 Mock 静态测试源', value: 'mock' }
                  ]}
                />
              </div>
            </div>

            {/* 卡片 2 */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--aura-bg-secondary)', border: '1px solid var(--aura-border)' }}>
              <Typography.Text variant="secondary" style={{ fontSize: '13px' }}>暗色光晕（Theme Glow）</Typography.Text>
              <Flex justify="between" align="center" style={{ marginTop: '12px', height: '38px' }}>
                <Typography.Text style={{ fontSize: '14px' }}>开启环境光阴影</Typography.Text>
                <Switch
                  checked={glowEnabled}
                  onChange={(checked) => {
                    setGlowEnabled(checked);
                    message.info(checked ? '阴影光晕已启用' : '阴影光晕已禁用');
                  }}
                />
              </Flex>
            </div>
          </div>

          {/* AI 交互命令行 */}
          <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--aura-bg-secondary)', border: '1px solid var(--aura-border)' }}>
            <Typography.Title level={5} style={{ marginTop: 0, marginBottom: '8px', fontSize: '15px' }}>
              💡 AI 编码指令下发 (AI-Driven Feature Mock)
            </Typography.Title>
            <Typography.Paragraph style={{ color: 'var(--aura-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              组件库内置了 MCP 接口规范，AI 可在此解析并生成代码来重构页面逻辑。
            </Typography.Paragraph>

            <Flex gap="md" align="center">
              <div style={{ flex: 1 }}>
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="输入给编译助手的任务指令..."
                  style={{ width: '100%' }}
                />
              </div>
              <Button
                variant="primary"
                loading={isDeploying}
                onClick={handleDeploy}
                style={{ minWidth: '100px' }}
              >
                AI 部署
              </Button>
            </Flex>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
