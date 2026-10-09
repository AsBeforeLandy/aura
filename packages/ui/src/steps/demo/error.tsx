import React from 'react';
import { Button, Steps } from '@aura-react-comp/ui';

/** Step 的 `status="error"` 出错态：支付步骤失败，可回退重试。 */
export default () => (
  <div>
    <Steps current={1}>
      <Steps.Step title="填写信息" description="收货地址与联系方式" />
      <Steps.Step title="支付订单" status="error" subTitle="余额不足" description="可更换支付方式重试" />
      <Steps.Step title="完成" />
    </Steps>
    <div style={{ marginTop: 24 }}>
      <Button variant="primary">返回重试</Button>
    </div>
  </div>
);
