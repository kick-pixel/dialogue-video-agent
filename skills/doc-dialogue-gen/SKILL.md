# doc-dialogue-gen Skill

## 功能
读取技术文档，调用 LLM 生成双角色对话脚本（dialogue.json）。

## 输入
- `doc_content`: 文档文本内容
- `doc_title`: 文档标题（用于 meta 字段）

## 输出
- `dialogue`: 符合 dialogue.json v2 schema 的 Python dict

## 角色
- 小白🐰：白兔，好奇提问者，声音甜美
- 大橘🦊：橘狐，技术解说者，声音沉稳

## 关键词样式
- `highlight-card`: 通用关键词，从右侧霓虹飞入
- `pop-badge`: 短词/缩写，从嘴部 pop 弹出
- `code-block`: 代码/命令，打字机效果
- `definition-card`: 词+一句解释，从下向上展开
- `timeline-node`: 步骤/流程，从左串联出现
