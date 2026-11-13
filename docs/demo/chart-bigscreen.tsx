import React from 'react';
import {
  BarChart,
  FunnelChart,
  GaugeChart,
  HeatmapChart,
  LineChart,
  PieChart,
  RadarChart,
  RingProgress,
  Sparkline,
  WaterfallChart,
  darkTheme,
} from '@aura-react-comp/charts';
import { ParticleField, Scene3D, Surface3D } from '@aura-react-comp/charts-3d';

/**
 * 大屏示例：把 18 个图表里的代表组合成一块深色监控大屏。
 *
 * 深色实现只用两件事：
 *   1. 图表传 `theme={darkTheme}`（库内置的暗色主题）；
 *   2. 容器自己写深色背景与文字色 —— 卡片装饰是页面的责任，不是图表的。
 * 不需要改任何图表组件。
 */

/* ---------- 配色体系：必须在所有数据定义之前 ---------- */

const PALETTE = {
  /** 径向渐变底：顶部微亮的天蓝晕开到深空蓝，比纯灰黑更有纵深 */
  bg: 'radial-gradient(ellipse at 50% -10%, #10305e 0%, #081428 58%)',
  panel: 'rgba(23, 68, 130, 0.22)',
  border: 'rgba(56, 189, 248, 0.24)',
  text: '#e0f2fe',
  sub: '#8fb8d8',
  accent: '#a78bfa',
  cyan: '#38bdf8',
};

/**
 * 大屏配色体系：深空蓝底上只允许两个色相——
 *   青色（#22d3ee 系）承载数据，紫色（#a855f7 系）做品牌强调；
 *   同色系用明度阶梯区分层级，红 / 绿只保留给涨跌语义。
 * 多系列图表统一传这一组 palette，避免默认色板的多色相在深底上互相打架。
 */
/** 环图 / 漏斗的单色系明度阶梯：层级靠明度，不靠色相 */
const CYAN_LADDER = ['#0c4a6e', '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc'];

/* ---------- 确定性数据（不用 Math.random，保证每次渲染一致） ---------- */

const line = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  online: Math.round(220 + Math.sin(i / 3.4) * 90 + Math.cos(i / 8) * 40),
  offline: Math.round(60 + Math.sin(i / 5 + 2) * 25),
}));

const bars = ['华东', '华南', '华北', '西南', '东北'].map((region, i) => ({
  region,
  online: 3200 - i * 420 + Math.round(Math.sin(i * 1.7) * 260),
  store: 2100 - i * 260 + Math.round(Math.cos(i * 2.1) * 180),
}));

const pie = [
  { name: 'App', value: 4260 },
  { name: '小程序', value: 3380 },
  { name: 'Web', value: 2150 },
  { name: 'H5', value: 1210 },
];

const radarSeries = [
  {
    key: 'thisWeek',
    name: '本周',
    values: [86, 72, 90, 64, 78],
    color: PALETTE.cyan,
  },
  {
    key: 'lastWeek',
    name: '上周',
    values: [70, 66, 82, 58, 70],
    color: '#64748b',
  },
];

const heat = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].flatMap(
  (day, dayIndex) =>
    Array.from({ length: 12 }, (_, h) => ({
      x: `${h * 2}`,
      y: day,
      value: Math.round(
        30 +
          Math.exp(-((h - 5) ** 2) / 6) * (dayIndex < 5 ? 70 : 45) +
          Math.exp(-((h - 9) ** 2) / 8) * 90,
      ),
    })),
);

const funnel = [
  { name: '访问', value: 9600 },
  { name: '加购', value: 5200 },
  { name: '下单', value: 3100 },
  { name: '支付', value: 1880 },
];

/** 曲面：双峰高斯 + 正弦扰动，确定性生成 */
const surface = Array.from({ length: 14 }, (_, row) =>
  Array.from({ length: 14 }, (_, col) => {
    const dx = col / 13 - 0.5;
    const dz = row / 13 - 0.5;
    return Math.round(
      50 +
        Math.exp(-(dx * dx + dz * dz) * 22) * 55 +
        Math.exp(-((dx - 0.32) ** 2 + (dz + 0.3) ** 2) * 30) * 30 +
        Math.sin(col / 2 + row) * 6,
    );
  }),
);

const waterfall = [
  { name: 'Q3 结余', value: 820, isTotal: true },
  { name: '人力', value: -260 },
  { name: '云资源', value: -180 },
  { name: '营销', value: 320 },
  { name: 'Q4 预算', value: 700, isTotal: true },
];

/* ---------- 卡片与布局 ---------- */

const cardStyle: React.CSSProperties = {
  background: PALETTE.panel,
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 10,
  padding: '10px 12px 6px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

const Card: React.FC<{
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, extra, children }) => (
  <div style={cardStyle}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: PALETTE.sub,
        marginBottom: 6,
      }}
    >
      <span style={{ color: PALETTE.text, fontWeight: 600, letterSpacing: 1 }}>
        {title}
      </span>
      {extra}
    </div>
    <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
  </div>
);

const Kpi: React.FC<{
  label: string;
  value: string;
  delta: string;
  data: number[];
}> = ({ label, value, delta, data }) => (
  <div style={{ ...cardStyle, padding: 10 }}>
    <div style={{ fontSize: 12, color: PALETTE.sub }}>{label}</div>
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 4,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: PALETTE.text,
            fontFamily: 'DIN, system-ui',
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 11, color: PALETTE.cyan }}>{delta}</div>
      </div>
      <div style={{ width: 96, height: 36 }}>
        <Sparkline
          data={data}
          type="area"
          smooth
          height={36}
          width={96}
          theme={darkTheme}
          color={PALETTE.cyan}
          showLast={false}
        />
      </div>
    </div>
  </div>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      padding: '12px 0 10px',
      borderBottom: `1px solid ${PALETTE.border}`,
    }}
  >
    {/* 大屏标题的两侧装饰线：向青色渐隐，收住整屏的视线 */}
    <span
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to left, ${PALETTE.cyan}, transparent)`,
      }}
    />
    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 6,
        color: PALETTE.text,
      }}
    >
      {children}
    </span>
    <span
      style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(to right, ${PALETTE.cyan}, transparent)`,
      }}
    />
  </div>
);

/** 大屏主体。外层 data-theme="dark" 让库内的 CSS 变量也切到暗色 */
const BigScreen: React.FC = () => (
  <div
    data-theme="dark"
    style={{
      background: PALETTE.bg,
      borderRadius: 12,
      padding: '0 14px 14px',
      color: PALETTE.text,
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    {/* 粒子星野：背景装饰层（无连线、低透明度），内容层叠在其上 */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.55,
      }}
    >
      <ParticleField
        count={170}
        showLinks={false}
        speed={0.5}
        particleSize={1.8}
      />
    </div>

    <div style={{ position: 'relative' }}>
      <Title>AURA 智慧运营大屏</Title>

      {/* KPI 行 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          margin: '10px 0',
        }}
      >
        <Kpi
          label="今日订单"
          value="18,204"
          delta="▲ 12.4% vs 昨日"
          data={[8, 9, 7, 11, 10, 13, 12, 15]}
        />
        <Kpi
          label="GMV（万）"
          value="3,264"
          delta="▲ 8.1% vs 昨日"
          data={[12, 10, 13, 12, 14, 13, 16, 17]}
        />
        <Kpi
          label="在线设备"
          value="1,842"
          delta="在线率 96.2%"
          data={[14, 13, 14, 15, 14, 16, 15, 16]}
        />
        <Kpi
          label="支付转化"
          value="3.86%"
          delta="▲ 0.4pp"
          data={[5, 6, 5, 7, 6, 8, 7, 9]}
        />
      </div>

      {/* 三列主网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        <Card title="订单趋势（24h）">
          <LineChart
            data={line}
            xKey="hour"
            height={210}
            smooth
            theme={darkTheme}
            legend={{ position: 'top' }}
            series={[
              { key: 'online', name: '线上', color: PALETTE.cyan },
              { key: 'offline', name: '线下', color: '#64748b' },
            ]}
          />
        </Card>

        <Card title="区域销量（线上 / 门店）">
          <BarChart
            data={bars}
            xKey="region"
            stack
            height={210}
            theme={darkTheme}
            palette={[PALETTE.cyan, PALETTE.accent]}
            series={[
              { key: 'online', name: '线上' },
              { key: 'store', name: '门店' },
            ]}
          />
        </Card>

        <Card title="渠道占比">
          <PieChart
            data={pie}
            height={210}
            innerRadius={0.62}
            theme={darkTheme}
            palette={CYAN_LADDER}
          />
        </Card>

        <Card title="服务能力评估">
          <RadarChart
            indicators={[
              { name: '响应', max: 100 },
              { name: '交付', max: 100 },
              { name: '质量', max: 100 },
              { name: '服务', max: 100 },
              { name: '成本', max: 100 },
            ]}
            series={radarSeries}
            height={220}
            theme={darkTheme}
          />
        </Card>

        <Card title="时段活跃热力">
          <HeatmapChart
            data={heat}
            height={220}
            cellGap={2}
            showValue={false}
            theme={darkTheme}
            colorRange={['#134e4a', '#22d3ee']}
          />
        </Card>

        <Card title="履约指标">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              height: '100%',
            }}
          >
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <GaugeChart
                value={92}
                min={0}
                max={100}
                unit="%"
                label="设备完好率"
                height={200}
                theme={darkTheme}
                ranges={[{ to: 100, color: PALETTE.cyan }]}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateRows: '1fr auto',
                placeItems: 'center',
                gap: 6,
              }}
            >
              <GaugeChart
                value={87}
                min={0}
                max={100}
                unit="%"
                label="准时交付"
                height={140}
                theme={darkTheme}
                ranges={[{ to: 100, color: PALETTE.cyan }]}
              />
              <div style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
                <RingProgress
                  value={76}
                  max={100}
                  size={52}
                  theme={darkTheme}
                  color={PALETTE.cyan}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: PALETTE.text,
                    }}
                  >
                    76%
                  </span>
                </RingProgress>
                <span style={{ fontSize: 11, color: PALETTE.sub }}>
                  库存周转
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="转化漏斗">
          <FunnelChart
            data={funnel}
            height={220}
            theme={darkTheme}
            palette={[...CYAN_LADDER].reverse().slice(0, 4)}
          />
        </Card>

        <Card title="季度预算瀑布（万）">
          <WaterfallChart
            data={waterfall}
            height={220}
            theme={darkTheme}
            positiveColor={PALETTE.cyan}
            negativeColor="#fb7185"
            totalColor="#818cf8"
          />
        </Card>

        <Card title="能耗曲面（3D · 可拖转）">
          <Scene3D height={230} cameraPosition={[260, 220, 300]} autoRotate>
            <Surface3D
              values={surface}
              width={200}
              depth={200}
              maxHeight={70}
              wireframe
            />
          </Scene3D>
        </Card>

        <Card title="大屏构建要点">
          <ul
            style={{
              margin: '6px 0 0',
              paddingLeft: 18,
              fontSize: 12,
              lineHeight: 1.9,
              color: PALETTE.sub,
            }}
          >
            <li>
              深色 = <b style={{ color: PALETTE.text }}>data-theme="dark"</b> +
              图表传 darkTheme，组件零改动
            </li>
            <li>全部数据确定性生成，刷新不变，可直接录屏</li>
            <li>点数超阈值自动切 Canvas，缩略轴 / 采样开箱即用</li>
            <li>无障碍：每张图都有隐藏数据表，读屏可用</li>
            <li>3D 曲面：@aura-react-comp/charts-3d，同套令牌与拖转交互</li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
);

export default BigScreen;
