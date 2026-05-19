import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = path.resolve(__dirname, '../../skill/skills');

/**
 * 将 Skill 文件安装到 IDE 对应目录
 * 支持目标：Claude Code (~/.claude/skills/)
 */
export async function installSkill() {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const claudeDir = path.join(homeDir, '.claude', 'skills');

  // 确保源目录存在
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Skill 目录不存在: ${SKILLS_DIR}`);
    console.error('请确认 @aura/skill 包已正确安装。');
    process.exit(1);
  }

  // 确保目标目录存在
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // 复制所有 skill 文件
  const files = fs.readdirSync(SKILLS_DIR).filter((f: string) => f.endsWith('.md'));
  if (files.length === 0) {
    console.warn('未找到任何 skill 文件。');
    return;
  }

  for (const file of files) {
    const src = path.join(SKILLS_DIR, file);
    const dest = path.join(claudeDir, file);
    fs.copyFileSync(src, dest);
    console.log(`  已安装: ${file} → ${dest}`);
  }

  console.log(`\n✅ ${files.length} 个 skill 已安装到 ${claudeDir}`);
}
