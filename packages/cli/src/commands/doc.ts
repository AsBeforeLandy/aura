import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_SRC = path.resolve(__dirname, '../../../ui/src');

/**
 * 显示指定组件的文档信息
 * 包括 index.md（如有）、demo 示例、接口定义
 */
export async function showDoc(component: string) {
  const compDir = path.join(UI_SRC, component);

  if (!fs.existsSync(compDir)) {
    // 列出可用组件
    const available = fs
      .readdirSync(UI_SRC)
      .filter((f: string) => fs.statSync(path.join(UI_SRC, f)).isDirectory());
    console.error(`组件 "${component}" 不存在。`);
    console.error(`可用组件: ${available.join(', ')}`);
    process.exit(1);
  }

  console.log(`# ${component}\n`);

  // 读取 index.md（dumi 文档）
  const mdPath = path.join(compDir, 'index.md');
  if (fs.existsSync(mdPath)) {
    console.log(fs.readFileSync(mdPath, 'utf-8'));
    console.log('');
  }

  // 读取 demo 示例
  const demoDir = path.join(compDir, 'demo');
  if (fs.existsSync(demoDir)) {
    const demoFiles = fs
      .readdirSync(demoDir)
      .filter((f: string) => f.endsWith('.tsx') || f.endsWith('.ts'));
    if (demoFiles.length > 0) {
      console.log('## 示例\n');
      for (const file of demoFiles) {
        const demoPath = path.join(demoDir, file);
        console.log(`### ${file}\n`);
        console.log('```tsx');
        console.log(fs.readFileSync(demoPath, 'utf-8'));
        console.log('```\n');
      }
    }
  }

  // 读取接口定义
  const tsxPath = path.join(compDir, 'index.tsx');
  if (fs.existsSync(tsxPath)) {
    const content = fs.readFileSync(tsxPath, 'utf-8');
    const interfaces = content.match(
      /export (interface|type)\s+\w+[\s\S]*?\n\}/g,
    );
    if (interfaces && interfaces.length > 0) {
      console.log('## 接口定义\n');
      console.log('```typescript');
      interfaces.forEach((i) => console.log(i + '\n'));
      console.log('```');
    }
  }
}
