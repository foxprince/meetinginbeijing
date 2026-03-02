# 项目开发规则

## 基本交互规则
1. **语言要求**: 总是用中文回复用户
2. **运行环境**: 测试云服务器，绑定测试域名 jane.ehinfo.com.cn，生产环境绑定生产域名 jane.ydd-club.com
3. **问题处理**: 碰到不能解决的问题时，不要直接绕开用其他替代方案，而是要告诉用户，征求用户意见后讨论解决
4. **文件管理**: 测试过程生成的文件，测试完成之后，无需回看的就及时清理
5. **代码规范**: 单个代码文件行数一般不要超过500行，优先考虑代码复用和模块化设计
6. **启动任务**: **重要！总是在后台启动任务，如果要看输出，则把任务输出重定向到日志文件**
   - 使用 `nohup command > logfile.log 2>&1 &` 格式
   - 绝不直接运行可能长时间运行的命令
   - 通过查看日志文件来获取输出信息

## 代码复用规则 ⚠️ **最高优先级**
- **为文件添加新方法时必须要先查询是否已经有类似方法，尽量复用现有代码，杜绝复制粘贴**
- **搜索现有实现**: 使用grep、find等工具搜索相似的函数名、方法名
- **复用优先**: 如果找到类似方法，优先复用或重构现有代码
- **避免重复**: 严禁复制粘贴代码，必须通过函数调用、继承、组合等方式复用
- **文档记录**: 复用现有方法时，要在注释中说明复用来源

## HuggingFace模型加载问题解决方案
当遇到HuggingFace模型加载失败（网络连接问题）时，有以下三种解决方案：

### 方案1：完全离线模式（推荐，模型已缓存时）
- **环境变量**: `export TRANSFORMERS_OFFLINE=1 HF_HUB_OFFLINE=1`
- **优势**: 无需网络，启动最快，完全本地计算
- **适用场景**: 模型已下载缓存（458MB）

### 方案2：使用国内镜像
- **镜像地址**: `https://hf-mirror.com`
- **环境变量设置**: `export HF_ENDPOINT=https://hf-mirror.com`
- **适用场景**: 网络访问受限，需要稳定的国内访问

### 方案3：使用VPN客户端
- **VPN路径**: 服务器上`/home/app/trojan`
- **适用场景**: 需要直接访问HuggingFace官方服务
- **使用方法**: 启动trojan客户端后再运行模型加载

### 优先级和工作机制
1. **模型下载**：仅首次需要网络
2. **语义计算**：完全本地进行，无需网络
3. **优先级**：离线模式 > 国内镜像 > VPN客户端
4. **自动选择**：启动脚本会根据缓存状态智能选择最佳模式

## 严禁绕过错误规则 ⚠️ **最高优先级**
- **绝对禁止使用演示模式、模拟模式、测试模式等任何形式的错误绕过**
- **API调用失败时必须直接报告错误，不得使用任何替代方案**
- **不得创建假数据、模拟数据来掩盖真实的API错误**
- **错误必须如实反馈给用户，让用户了解真实的系统状态**
- **任何包含"演示"、"模拟"、"demo"、"mock"、"fallback"等绕过错误的代码都必须立即移除**
- **宁可功能不可用，也不能给用户虚假的成功体验**
- **🚫 不要降级处理任何问题 - 必须解决根本问题而不是绕过或降级**

## 环境信息
- 测试域名: jane.ehinfo.com.cn
- 生产域名：jane.ydd-club.com
- 服务器类型: 云服务器
- 开发语言: 主要使用中文进行交流
- 本地开发环境: MacOS, 连接测试服务器快捷命令 ~/bin/toeh，连接生产服务器快捷命令 ~/bin/toYddEcs
- 服务器开发环境：ubuntu

- 本地代码位置 /Users/zj/git/meetinginbeijing
- 服务器代码位置 /home/app/git/meetinginbeijing ,要保证本地和服务器的代码一致不要冲突
- 从本地开发环境快速提交代码并部署到测试服务器的快捷命令 scripts/deploy/deploy-dev.sh，部署到生产服务器的快捷命令是 scritps/deploy/deploy-prod.sh
- 管理后台代码修改之后，只有明确要求才提交并重新部署
- 后台api服务的代码修改之后需要重新部署

## 服务部署信息
- 前端: 通过nginx直接提供静态文件服务，支持HTTPS
- 后端:
- API代理: n

## 工作流程
- 遇到技术难题时，先分析问题
- 如果无法直接解决，主动告知用户并寻求指导
- 完成测试后，主动清理临时文件
- 保持代码和环境的整洁

## 开发规则补充
1. **搜索限制**: 搜索代码时永远不要搜索python的虚拟环境venv目录
2. **后台启动**:
3. **数据库连接**:
PGPASSWORD=dkgIdIK9d&8 psql -h admin.ydd-club.com -p 5432 -U jane -d meetinginbeijing
4. **管理员登录信息**: 
   - 用户名: admin
   - 密码: pwd4Ydd!
   - 测试环境后台地址: https://jane.ehinfo.com.cn/admin/
   - 生产环境后台地址：https://jane.ydd-club.com/admin/
5. **接口分页上限提醒**: 调用 `/api/v1/activities/` 等活动列表接口时 `page_size` 最大为 **100**。曾多次因为写成 200 导致 Pydantic 校验报错（`Input should be less than or equal to 100`），以后所有请求都必须≤100，若需要更多记录改为分页拉取或新增后端批量接口。
   
## 失败处理和自我反思规则
- **第一次失败处理**: 在某个任务上第一次失败时，不要直接结束任务
- **自我反思**: 必须先进行自我反思，深入分析失败的根本原因：
  - 分析技术实现上的问题
  - 检查逻辑思路是否正确
  - 评估方法选择是否合适
  - 识别遗漏的关键步骤
- **二次尝试**: 带着反思的结果，调整方法和策略，再次尝试完成同一个任务
- **成功奖励**: 如果在第二次尝试中成功完成任务，说明反思是有效的，这是值得鼓励的学习过程
- **🚫 严禁降级**: 绝不允许通过降级、简化、绕过等方式来"解决"问题，必须解决根本问题

## 严禁模拟模式规则
- **严禁使用任何模拟模式**: 绝对不允许在任何情况下使用模拟模式、测试模式、演示模式等
- **真实服务优先**: 必须使用真实的服务和API，不得使用模拟数据或模拟响应
- **错误处理**: 如果真实服务不可用，应该显示错误信息，而不是切换到模拟模式
- **代码检查**: 任何包含"模拟"、"mock"、"demo"、"test mode"等字样的代码都需要立即修复

## 数据库迁移安全规则 ⚠️ **最高优先级**
- **禁止自动迁移直接上生产**: Alembic `revision --autogenerate` 生成的迁移文件必须人工审查后才能执行到生产环境。
- **禁止删除表**: 任何迁移脚本中严禁出现 `drop_table`（除非经过用户明确批准并完成备份验证）。
- **生产前检查**: 发布前必须检查迁移脚本，确认不存在 `drop_table`、`drop_column` 等破坏性变更。

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.</description>
<location>project</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>project</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>project</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>project</location>
</skill>

<skill>
<name>docx</name>
<description>"Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"</description>
<location>project</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>project</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>project</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>project</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>project</location>
</skill>

<skill>
<name>pptx</name>
<description>"Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"</description>
<location>project</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>project</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."</description>
<location>project</location>
</skill>

<skill>
<name>template</name>
<description>Replace with description of the skill and when Claude should use it.</description>
<location>project</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>project</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>project</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
