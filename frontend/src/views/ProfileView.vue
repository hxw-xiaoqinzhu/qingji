<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Scrollable Studio Workbench (Adaptive safe-area top spacing, no top header bar) -->
    <div
      class="scroll-pane no-scrollbar px-4 pb-8 space-y-4"
      style="padding-top: calc(var(--safe-top) + 14px)"
    >
      <!-- Editorial Couture Studio Hero Card (Tap to customize avatar, nickname & playful quote) -->
      <section
        class="hero-studio-card relative overflow-hidden stagger-item pressable cursor-pointer"
        @click="openProfileEditor"
      >
        <!-- Soft Ambient Silk-Blush Light Blooms -->
        <div class="hero-orb hero-orb-1" aria-hidden="true" />
        <div class="hero-orb hero-orb-2" aria-hidden="true" />

        <!-- Subtle Editorial Sparkle Watermark -->
        <svg
          class="pointer-events-none absolute right-3 top-2.5 w-16 h-16 opacity-[0.45]"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
        >
          <path d="M52 12L54.8 21.2L64 24L54.8 26.8L52 36L49.2 26.8L40 24L49.2 21.2L52 12Z" fill="#E8BCC9" />
          <path d="M26 42L27.6 47.4L33 49L27.6 50.6L26 56L24.4 50.6L19 49L24.4 47.4L26 42Z" fill="#EFD3BC" />
          <circle cx="62" cy="48" r="2.2" fill="#E9C2CE" />
        </svg>

        <div class="relative z-10">
          <div class="flex items-center gap-3.5">
            <!-- Double-Ring Circular Couture Avatar Frame -->
            <div class="relative shrink-0">
              <div class="avatar-ring">
                <StudioAvatar :src="auth.user?.avatarUrl" :size="62" rounded-class="rounded-full" />
              </div>
              <span
                class="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white/95 border border-[#F0DCE3] shadow-[0_2px_8px_rgba(173,116,133,0.18)] flex items-center justify-center text-[#AD7485]"
              >
                <Camera class="w-3 h-3" />
              </span>
            </div>

            <!-- Nickname + Playful Quote -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <h2 class="text-[20px] font-semibold text-ink tracking-tight truncate">
                  {{ auth.user?.studioName || '嘻嘻化妆室' }}
                </h2>
                <span
                  class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 border border-[#F0DFE5] text-[11px] font-medium text-[#A46B7D]"
                >
                  <Pencil class="w-2.5 h-2.5" />
                  <span>装扮</span>
                </span>
              </div>
              <p class="text-[12.5px] text-[#7D636D] leading-[1.45] mt-1.5 line-clamp-2">
                {{ auth.user?.bio || '每一笔粉黛，都是双向奔赴的浪漫 ✨' }}
              </p>
            </div>
          </div>

          <!-- Whisper Greeting Strip -->
          <div class="mt-4 pt-3 border-t border-[#F1E1E7]/75 flex items-center justify-between text-[11px]">
            <span class="inline-flex items-center gap-1.5 text-[#9B7380] font-medium">
              <Sparkles class="w-3 h-3 text-[#C98A9D]" />
              <span>{{ timeGreeting }}</span>
            </span>
            <span class="text-[#B69BA4]">轻点自定义头像与签名</span>
          </div>
        </div>
      </section>

      <!-- Group 1: Bespoke Beauty Tools (Unified Pale Blush Squircles) -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 1">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">美妆百宝箱</div>
        <button type="button" class="menu-row" @click="router.push('/profile/packages')">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconLipstick :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">报价套餐与增项库</div>
              <div class="text-[11px] text-ink-muted">管理价目并一键生成报价海报</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openClients">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconVanityMirror :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">新娘客户肤质档案</div>
              <div class="text-[11px] text-ink-muted">肤质禁忌、历史订单与一键回访</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openChecklistTpl">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconCosmeticCase :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">化妆箱出妆清单模板</div>
              <div class="text-[11px] text-ink-muted">凌晨出门前逐项打钩防遗漏</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="openNoticeTpl">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconLoveNote :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">新娘妆前须知贴士</div>
              <div class="text-[11px] text-ink-muted">自动印制在《预约确认函》底部</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>

      <!-- Group 2: Share & Apple Calendar Sync -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 2">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">分享与日历同步</div>
        <button type="button" class="menu-row" @click="copyPublicSchedule">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconSilkLink :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">复制对外只读档期链接</div>
              <div class="text-[11px] text-ink-muted">严格脱敏，仅向新娘展示可约/已定</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="previewPublicSchedule">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconPosterCard :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">预览新娘视角档期页</div>
              <div class="text-[11px] text-ink-muted">查看客户打开链接时的真实效果</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>

        <button type="button" class="menu-row" @click="copyIcsLink">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <IconCalendarSync :size="19" />
            </span>
            <div class="text-left">
              <div class="font-medium text-ink">复制苹果日历订阅 (.ics)</div>
              <div class="text-[11px] text-ink-muted">添加至原生日历，锁屏实时提醒行程</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>

      <!-- Group 3: Account & Security (Unified Pale Blush Squircles matching above groups) -->
      <section class="card-soft p-2.5 stagger-item" style="--stagger: 3">
        <div class="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-ink-muted tracking-wider">安全与多端同步</div>
        <button type="button" class="menu-row" @click="openPasswordSheet">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <KeyRound class="w-[18px] h-[18px]" />
            </span>
            <span class="font-medium text-ink">修改登录密码</span>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
        <button type="button" class="menu-row" @click="openSessions">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <Smartphone class="w-[18px] h-[18px]" />
            </span>
            <span class="font-medium text-ink">多端已登录设备管理</span>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
        <button type="button" class="menu-row" @click="openRecycleBin">
          <div class="flex items-center gap-3">
            <span class="icon-squircle" style="background: #FAF0F3; color: #AD7485">
              <Trash2 class="w-[18px] h-[18px]" />
            </span>
            <span class="font-medium text-ink">30 天订单回收站</span>
          </div>
          <ChevronRight class="w-4 h-4 text-ink-muted" />
        </button>
      </section>

      <!-- Bottom Logout Button -->
      <div class="pt-1 pb-2 stagger-item" style="--stagger: 4">
        <button
          type="button"
          class="btn-unified btn-glass w-full !text-status-danger-text"
          @click="handleLogout"
        >
          退出当前账号
        </button>
      </div>
    </div>

    <!-- Sheet: Custom Profile Card Editor (Avatar + Nickname + Playful Quote) -->
    <van-popup v-model:show="showProfileEditor" position="bottom" teleport="body" round :style="{ maxHeight: '88dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col max-h-[88dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">装扮我的工作室名片</h3>
            <p class="text-[11px] text-ink-muted mt-0.5">自定义专属头像、昵称与俏皮小签名</p>
          </div>
          <button type="button" class="icon-btn-white" @click="showProfileEditor = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-2">
          <!-- Avatar Preview + Upload + Presets -->
          <div class="bg-[#FAF2F5]/75 border border-[#F2E4E9] rounded-2xl p-4 space-y-3.5">
            <div class="flex items-center gap-4">
              <div class="avatar-ring shrink-0">
                <StudioAvatar :src="profileForm.avatarUrl" :size="64" rounded-class="rounded-full" />
              </div>
              <div class="flex-1 min-w-0 space-y-2">
                <div class="text-[13px] font-semibold text-ink">专属头像</div>
                <div class="flex items-center gap-2">
                  <label
                    class="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full bg-white border border-[#EEDCE3] text-[12px] font-medium text-[#A46B7D] cursor-pointer pressable"
                  >
                    <Camera class="w-3.5 h-3.5" />
                    <span>{{ uploadingAvatar ? '上传中...' : '从相册上传' }}</span>
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      :disabled="uploadingAvatar"
                      @change="onAvatarFileChange"
                    />
                  </label>
                  <button
                    v-if="profileForm.avatarUrl && profileForm.avatarUrl !== 'preset:ribbon'"
                    type="button"
                    class="px-3 h-8 rounded-full bg-white/80 text-[11.5px] text-ink-muted"
                    @click="profileForm.avatarUrl = 'preset:ribbon'"
                  >
                    恢复默认
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div class="text-[11px] text-ink-muted mb-2">或挑选一枚软萌插画头像</div>
              <div class="grid grid-cols-4 gap-2.5">
                <button
                  v-for="preset in avatarPresets"
                  :key="preset.id"
                  type="button"
                  class="flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all pressable"
                  :class="
                    (profileForm.avatarUrl || 'preset:ribbon') === preset.id
                      ? 'bg-white border-[#D99AAF] shadow-[0_4px_12px_rgba(201,134,154,0.18)]'
                      : 'bg-white/60 border-transparent'
                  "
                  @click="profileForm.avatarUrl = preset.id"
                >
                  <StudioAvatar :src="preset.id" :size="42" rounded-class="rounded-full" />
                  <span class="text-[10.5px] text-ink-secondary font-medium">{{ preset.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Nickname & Optional Contact Phone -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[12px] font-medium text-ink-secondary mb-1.5">工作室 / 化妆师昵称</label>
              <input
                v-model.trim="profileForm.studioName"
                type="text"
                maxlength="30"
                placeholder="例如：嘻嘻化妆室"
                class="w-full input-silk px-3.5 h-[42px]"
              />
            </div>
            <div>
              <label class="block text-[12px] font-medium text-ink-secondary mb-1.5">预约电话（选填）</label>
              <input
                v-model.trim="profileForm.phone"
                type="tel"
                maxlength="20"
                placeholder="印于海报与确认函"
                class="w-full input-silk px-3.5 h-[42px] tabular-nums"
              />
            </div>
          </div>

          <!-- Playful Quote / Bio -->
          <div>
            <label class="block text-[12px] font-medium text-ink-secondary mb-1.5">俏皮个性签名</label>
            <input
              v-model.trim="profileForm.bio"
              type="text"
              maxlength="60"
              placeholder="写一句属于你的可爱宣言吧~"
              class="w-full input-silk px-3.5 h-[42px]"
            />
            <div class="mt-2.5">
              <div class="text-[11px] text-ink-muted mb-1.5">灵感一句（点选即用）</div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="quote in playfulQuotes"
                  :key="quote"
                  type="button"
                  class="px-2.5 py-1.5 rounded-xl text-[11px] text-left transition-colors pressable"
                  :class="
                    profileForm.bio === quote
                      ? 'bg-brand text-white font-medium'
                      : 'bg-[#FAF2F5] text-[#7D636D]'
                  "
                  @click="profileForm.bio = quote"
                >
                  {{ quote }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn-unified w-full btn-rose text-white mt-3 shrink-0"
          :disabled="savingProfile"
          @click="saveProfileCard"
        >
          {{ savingProfile ? '保存中...' : '保存名片装扮' }}
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Complete Packages CRUD (Filter + Edit + Description + Duration + Copy Quote + Quick Book) -->
    <van-popup v-model:show="showPackagesSheet" position="bottom" teleport="body" round :style="{ minHeight: '62dvh', maxHeight: '88dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[62dvh] max-h-[88dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">报价套餐库 ({{ packages.length }})</h3>
            <p class="text-[11px] text-ink-muted mt-0.5">编辑完成后可一键生成专属可爱报价海报</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="packages.length > 0"
              type="button"
              class="inline-flex items-center gap-1 px-3 h-8 rounded-full bg-[#FAF0F3] text-[#A46B7D] text-[12px] font-medium pressable"
              @click="copyFullPriceList"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>复制文案</span>
            </button>
            <button type="button" class="icon-btn-white" @click="showPackagesSheet = false">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Category Filter Pills -->
        <div v-if="packages.length > 0" class="flex gap-1.5 mb-3 shrink-0">
          <button
            v-for="tab in packageFilterTabs"
            :key="tab.value"
            type="button"
            class="px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors"
            :class="pkgFilter === tab.value ? 'bg-brand text-white' : 'bg-[#FAF2F5] text-ink-secondary'"
            @click="pkgFilter = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-1">
          <div class="relative min-h-[180px]">
            <Transition name="skeleton-dissolve">
              <div v-if="loadingPackages" class="absolute inset-0 z-10 bg-white space-y-2.5 pointer-events-none">
                <div v-for="i in 3" :key="i" class="skeleton-box h-[84px] w-full rounded-2xl" />
              </div>
            </Transition>
            <div v-if="filteredPackages.length > 0" class="space-y-2.5">
              <div v-for="pkg in filteredPackages" :key="pkg.id" class="bg-canvas rounded-2xl p-3.5 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center flex-wrap gap-1.5">
                      <span class="text-[14.5px] font-semibold text-ink">{{ pkg.name }}</span>
                      <span
                        class="text-[10.5px] px-2 py-0.5 rounded-full font-medium"
                        :class="pkg.category === 'MAIN' ? 'bg-[#FAF0F3] text-[#AD7485]' : 'bg-white text-ink-secondary'"
                      >
                        {{ pkg.category === 'MAIN' ? '主套餐' : '增项' }}
                      </span>
                      <span
                        v-if="pkg.defaultDurationMin > 0"
                        class="text-[10.5px] px-2 py-0.5 rounded-full bg-white text-ink-muted tabular-nums"
                      >
                        约 {{ formatDurationLabel(pkg.defaultDurationMin) }}
                      </span>
                    </div>
                    <div class="text-[15px] text-brand-deep font-semibold tabular-nums mt-1">¥{{ pkg.price }}</div>
                    <p v-if="pkg.description" class="text-[11.5px] text-ink-secondary mt-1 leading-relaxed">
                      {{ pkg.description }}
                    </p>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      class="w-7 h-7 rounded-full bg-white text-ink-secondary flex items-center justify-center pressable"
                      aria-label="编辑套餐"
                      @click="startEditPackage(pkg)"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      class="w-7 h-7 rounded-full bg-white text-status-danger-text flex items-center justify-center pressable"
                      aria-label="删除套餐"
                      @click="deletePackage(pkg.id)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div v-if="pkg.category === 'MAIN'" class="pt-1 border-t border-[#EFE3E8]/80 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[11.5px] font-medium text-[#A46B7D] pressable"
                    @click="bookWithPackage(pkg)"
                  >
                    <span>用此套餐排单</span>
                    <ChevronRight class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <CuteEmptyState
              v-else-if="!loadingPackages"
              variant="packages"
              title="还没有保存的报价套餐"
              description="在下方添加常用妆造套餐或增项，排单时可直接点选带入"
              compact
            />
          </div>

          <!-- Add / Edit Package Card -->
          <div class="bg-[#FAF2F5]/80 border border-[#EFE2E6] rounded-2xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="text-[12.5px] font-semibold text-brand-deep">
                {{ editingPkgId ? '编辑套餐 / 增项' : '新增套餐 / 增项' }}
              </div>
              <button
                v-if="editingPkgId"
                type="button"
                class="text-[11.5px] text-ink-muted"
                @click="resetPkgForm"
              >
                取消编辑
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <input v-model.trim="newPkg.name" type="text" placeholder="套餐名称 *" class="w-full input-silk !bg-white px-3.5 h-[40px]" />
              <div class="input-affix-wrap !bg-white !h-[40px]">
                <span class="input-affix-unit mr-1">¥</span>
                <input v-model.number="newPkg.price" type="number" inputmode="decimal" placeholder="价格" class="tabular-nums font-medium" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <div class="flex gap-1.5 items-center">
                <button
                  type="button"
                  class="flex-1 h-[38px] rounded-xl text-[12px] font-medium transition-colors"
                  :class="newPkg.category === 'MAIN' ? 'bg-brand text-white' : 'bg-white text-ink-secondary'"
                  @click="newPkg.category = 'MAIN'"
                >
                  主套餐
                </button>
                <button
                  type="button"
                  class="flex-1 h-[38px] rounded-xl text-[12px] font-medium transition-colors"
                  :class="newPkg.category === 'EXTRA' ? 'bg-brand text-white' : 'bg-white text-ink-secondary'"
                  @click="newPkg.category = 'EXTRA'"
                >
                  增项
                </button>
              </div>
              <div class="input-affix-wrap !bg-white !h-[38px]">
                <input
                  v-model.number="newPkg.durationHours"
                  type="number"
                  step="0.5"
                  min="0"
                  inputmode="decimal"
                  placeholder="预计时长"
                  class="tabular-nums"
                />
                <span class="input-affix-unit ml-1">小时</span>
              </div>
            </div>
            <input
              v-model.trim="newPkg.description"
              type="text"
              placeholder="服务包含内容说明（选填，如：含早妆+仪式+敬酒3套造型）"
              class="w-full input-silk !bg-white px-3.5 h-[40px]"
            />
            <button
              type="button"
              class="btn-unified w-full btn-glass !text-brand-deep !h-[40px] !text-[13px]"
              :disabled="savingPkg"
              @click="savePackage"
            >
              {{ savingPkg ? '保存中...' : editingPkgId ? '保存套餐修改' : '添加到报价套餐库' }}
            </button>
          </div>
        </div>

        <!-- Primary CTA: Confirm & Generate Cute Designer Price-List Poster -->
        <div v-if="packages.length > 0" class="pt-3 shrink-0">
          <button
            type="button"
            class="btn-unified w-full btn-rose text-white flex items-center justify-center gap-1.5"
            @click="openPricePoster"
          >
            <Sparkles class="w-4 h-4" />
            <span>确认生成可爱报价海报</span>
          </button>
        </div>
      </div>
    </van-popup>

    <!-- Cute Designer Price-List Poster Modal (Long-Press Image to Save to Album) -->
    <PriceListPosterModal
      v-model:show="showPricePoster"
      :studio-name="auth.user?.studioName || '嘻嘻化妆室'"
      :avatar-url="auth.user?.avatarUrl"
      :bio="auth.user?.bio"
      :phone="auth.user?.phone"
      :packages="packages"
    />

    <!-- Sheet: Rich Bride Client Archive (Search + Filters + Contact + Skin/Hair Edit + Expandable Order Details) -->
    <van-popup v-model:show="showClientsSheet" position="bottom" teleport="body" round :style="{ minHeight: '62dvh', maxHeight: '88dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[62dvh] max-h-[88dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">新娘客户档案 ({{ filteredClients.length }})</h3>
            <p class="text-[11px] text-ink-muted mt-0.5">随排单自动沉淀，清空回收站后同步清理</p>
          </div>
          <button type="button" class="icon-btn-white" @click="showClientsSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div v-if="clients.length > 0 || clientSearch" class="space-y-2.5 mb-3 shrink-0">
          <div class="input-search-pill !h-[38px] !bg-[#FAF5F7]">
            <Search class="w-3.5 h-3.5 text-ink-muted shrink-0" />
            <input
              v-model.trim="clientSearch"
              type="search"
              placeholder="搜姓名、手机号、微信号或肤质..."
              class="text-[13px]"
            />
            <button v-if="clientSearch" type="button" class="text-ink-muted" @click="clientSearch = ''">
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="tab in clientFilterTabs"
              :key="tab.value"
              type="button"
              class="px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors"
              :class="clientFilter === tab.value ? 'bg-brand text-white' : 'bg-[#FAF2F5] text-ink-secondary'"
              @click="clientFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar relative">
          <Transition name="skeleton-dissolve">
            <div v-if="loadingClients" class="absolute inset-0 z-10 bg-white space-y-3 pointer-events-none">
              <div v-for="i in 3" :key="i" class="skeleton-box h-[138px] w-full rounded-2xl" />
            </div>
          </Transition>

          <div v-if="filteredClients.length > 0" class="space-y-3 pb-2">
            <div v-for="c in filteredClients" :key="c.id" class="bg-canvas rounded-2xl p-4 space-y-2.5">
              <!-- Top Identity & Spend Row -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-9 h-9 rounded-xl bg-brand-soft text-brand-deep flex items-center justify-center text-[14px] font-semibold shrink-0">
                    {{ c.name.slice(0, 1) }}
                  </span>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[15px] font-semibold text-ink truncate">{{ c.name }}</span>
                      <span
                        v-if="c.source"
                        class="px-2 py-0.5 rounded-full bg-white text-[10px] text-ink-muted font-medium shrink-0"
                      >
                        {{ c.source }}
                      </span>
                    </div>
                    <div class="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                      共 {{ c.orderCount || 0 }} 单 · 累计 {{ ui.formatMoney(c.totalSpent || 0) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    class="w-7 h-7 rounded-full bg-white text-ink-secondary flex items-center justify-center pressable"
                    aria-label="编辑档案"
                    @click="openEditClient(c)"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    class="w-7 h-7 rounded-full bg-white text-status-danger-text flex items-center justify-center pressable"
                    aria-label="删除档案"
                    @click="deleteClientArchive(c)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Contact & Balance Strip -->
              <div class="flex flex-wrap items-center gap-2 text-[11.5px] tabular-nums">
                <a
                  v-if="c.phone"
                  :href="`tel:${c.phone}`"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-ink-secondary pressable"
                >
                  <Phone class="w-3 h-3 text-[#AD7485]" />
                  <span>{{ c.phone }}</span>
                </a>
                <button
                  v-if="c.wechat"
                  type="button"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-ink-secondary pressable"
                  @click="copyText(c.wechat, '已复制微信号')"
                >
                  <Copy class="w-3 h-3 text-[#AD7485]" />
                  <span>微信 {{ c.wechat }}</span>
                </button>
                <span
                  v-if="(c.pendingBalance || 0) > 0"
                  class="inline-flex items-center px-2.5 py-1 rounded-full bg-status-danger-bg text-status-danger-text font-medium"
                >
                  待收尾款 {{ ui.formatMoney(c.pendingBalance || 0) }}
                </span>
              </div>

              <!-- Beauty Profile Tags (Skin / Allergy / Hair) -->
              <div v-if="c.skinType || c.allergyNote || c.hairNote" class="bg-white/90 rounded-xl px-3 py-2 text-[11.5px] text-ink-secondary space-y-1">
                <div v-if="c.skinType || c.hairNote" class="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span v-if="c.skinType"><span class="text-ink-muted">肤质：</span>{{ c.skinType }}</span>
                  <span v-if="c.hairNote"><span class="text-ink-muted">发质：</span>{{ c.hairNote }}</span>
                </div>
                <div v-if="c.allergyNote" class="text-status-danger-text">
                  <span>过敏 / 禁忌：</span>{{ c.allergyNote }}
                </div>
              </div>

              <!-- Rich Order History Preview / Expandable List -->
              <div v-if="c.orders && c.orders.length > 0" class="space-y-1.5 pt-0.5">
                <div class="flex items-center justify-between text-[11px] text-ink-muted px-0.5">
                  <span>历史妆造行程</span>
                  <button
                    v-if="c.orders.length > 1"
                    type="button"
                    class="text-[#AD7485] font-medium"
                    @click="toggleClientExpand(c.id)"
                  >
                    {{ expandedClientIds.has(c.id) ? '收起' : `展开全部 ${c.orders.length} 单` }}
                  </button>
                </div>
                <button
                  v-for="o in (expandedClientIds.has(c.id) ? c.orders : c.orders.slice(0, 1))"
                  :key="o.id"
                  type="button"
                  class="w-full text-left bg-white rounded-xl p-2.5 border border-[#F3E6EB] flex items-center justify-between gap-2 pressable"
                  @click="jumpToOrder(o.id)"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[12.5px] font-semibold text-ink truncate">{{ o.serviceType }}</span>
                      <span
                        class="px-1.5 py-0.5 rounded-md text-[10px] font-medium shrink-0"
                        :class="[statusMeta(o.status, o.balanceDue).bgClass, statusMeta(o.status, o.balanceDue).textClass]"
                      >
                        {{ statusMeta(o.status, o.balanceDue).label }}
                      </span>
                    </div>
                    <div class="text-[11px] text-ink-muted mt-0.5 tabular-nums truncate">
                      {{ o.serviceDate }} {{ o.startTime }}-{{ o.endTime }}{{ o.location ? ` · ${o.location}` : '' }}
                    </div>
                  </div>
                  <div class="text-right shrink-0 tabular-nums">
                    <div class="text-[13px] font-semibold text-ink">{{ ui.formatMoney(o.totalAmount) }}</div>
                    <div v-if="o.balanceDue > 0" class="text-[10px] text-status-danger-text">
                      尾款 {{ ui.formatMoney(o.balanceDue) }}
                    </div>
                    <div v-else class="text-[10px] text-ink-muted">已结清</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="!loadingClients" class="h-full flex items-center justify-center py-6">
            <CuteEmptyState
              variant="clients"
              :title="clientSearch || clientFilter !== 'ALL' ? '未找到匹配的新娘档案' : '还没有新娘客户档案'"
              :description="clientSearch || clientFilter !== 'ALL' ? '换个关键词或筛选条件试试吧' : '完成第一笔排单后，将自动沉淀客户的肤质与历史记录'"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Edit Client Beauty Profile -->
    <van-popup v-model:show="showEditClientSheet" position="bottom" teleport="body" round :style="{ maxHeight: '84dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col max-h-[84dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-4 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">编辑新娘肤质档案</h3>
          <button type="button" class="icon-btn-white" @click="showEditClientSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-2">
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">客户姓名</label>
              <input v-model.trim="editClientForm.name" type="text" class="w-full input-silk px-3 h-[40px]" />
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">客源渠道</label>
              <input v-model.trim="editClientForm.source" type="text" placeholder="小红书 / 朋友介绍" class="w-full input-silk px-3 h-[40px]" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">手机号</label>
              <input v-model.trim="editClientForm.phone" type="tel" class="w-full input-silk px-3 h-[40px]" />
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">微信号</label>
              <input v-model.trim="editClientForm.wechat" type="text" class="w-full input-silk px-3 h-[40px]" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">肤质特征</label>
              <input v-model.trim="editClientForm.skinType" type="text" placeholder="例如：干敏肌、混油" class="w-full input-silk px-3 h-[40px]" />
            </div>
            <div>
              <label class="block text-[11.5px] text-ink-secondary mb-1">发质 / 发量</label>
              <input v-model.trim="editClientForm.hairNote" type="text" placeholder="例如：细软塌、齐腰长发" class="w-full input-silk px-3 h-[40px]" />
            </div>
          </div>
          <div>
            <label class="block text-[11.5px] text-ink-secondary mb-1">过敏史 / 妆造禁忌</label>
            <textarea
              v-model.trim="editClientForm.allergyNote"
              rows="2"
              placeholder="例如：酒精过敏、不喜欢厚重假睫毛"
              class="w-full input-silk p-3"
            />
          </div>
        </div>
        <button
          type="button"
          class="btn-unified w-full btn-rose text-white mt-3 shrink-0"
          :disabled="savingClient"
          @click="saveClientEdit"
        >
          {{ savingClient ? '保存中...' : '保存客户档案' }}
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Checklist Template -->
    <van-popup v-model:show="showChecklistSheet" position="bottom" teleport="body" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">化妆箱默认清点清单</h3>
          <button type="button" class="icon-btn-white" @click="showChecklistSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted">每行一项，每次新建妆造订单时自动生成</p>
        <textarea v-model="checklistText" rows="6" class="w-full input-silk p-3.5" />
        <button type="button" class="btn-unified w-full btn-rose text-white" @click="saveChecklistTpl">
          保存清单模板
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Notice Template -->
    <van-popup v-model:show="showNoticeSheet" position="bottom" teleport="body" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-semibold text-ink">新娘妆前准备贴士模板</h3>
          <button type="button" class="icon-btn-white" @click="showNoticeSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted">生成《新娘档期锁定确认函》时将附在底部</p>
        <textarea v-model="noticeText" rows="6" class="w-full input-silk p-3.5" />
        <button type="button" class="btn-unified w-full btn-rose text-white" @click="saveNoticeTpl">
          保存贴士文案
        </button>
      </div>
    </van-popup>

    <!-- Sheet: Multi-device Sessions -->
    <van-popup v-model:show="showSessionsSheet" position="bottom" teleport="body" round :style="{ minHeight: '50dvh', maxHeight: '80dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[50dvh] max-h-[80dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-1 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">多端在线设备管理</h3>
          <button type="button" class="icon-btn-white" @click="showSessionsSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>
        <p class="text-[12px] text-ink-muted mb-3 shrink-0">移除后该设备将自动退出并需重新登录</p>
        <div class="flex-1 overflow-y-auto no-scrollbar relative">
          <Transition name="skeleton-dissolve">
            <div v-if="loadingSessions" class="absolute inset-0 z-10 bg-white space-y-2.5 pointer-events-none">
              <div v-for="i in 2" :key="i" class="skeleton-box h-[66px] w-full rounded-2xl" />
            </div>
          </Transition>
          <div v-if="sessions.length > 0" class="space-y-2.5">
            <div v-for="s in sessions" :key="s.id" class="bg-canvas rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div class="text-[14px] font-medium text-ink flex items-center gap-2">
                  <span>{{ s.deviceInfo }}</span>
                  <span v-if="s.isCurrent" class="px-2 py-0.5 rounded-full bg-brand-soft text-brand-deep text-[10px] font-semibold">
                    本机在线
                  </span>
                </div>
                <div class="text-[11px] text-ink-muted mt-0.5 tabular-nums">
                  IP: {{ s.ip }} · 活跃于 {{ dayjs(s.lastActiveAt).format('MM-DD HH:mm') }}
                </div>
              </div>
              <button
                v-if="!s.isCurrent"
                type="button"
                class="icon-btn-white text-status-danger-text"
                aria-label="移除设备"
                @click="kickSession(s.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else-if="!loadingSessions" class="h-full flex items-center justify-center py-6">
            <CuteEmptyState variant="sessions" title="暂无在线设备记录" compact />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Recycle Bin (With One-Tap Empty Trash + Cascade Client Cleanup) -->
    <van-popup v-model:show="showRecycleSheet" position="bottom" teleport="body" round :style="{ minHeight: '54dvh', maxHeight: '82dvh' }">
      <div class="p-5 pb-safe-sheet flex flex-col min-h-[54dvh] max-h-[82dvh]">
        <div class="sheet-grabber shrink-0" />
        <div class="flex items-center justify-between mb-3 shrink-0">
          <h3 class="text-[17px] font-semibold text-ink">30 天订单回收站</h3>
          <div class="flex items-center gap-2">
            <button
              v-if="deletedOrders.length > 0"
              type="button"
              class="px-3 h-8 rounded-full bg-status-danger-bg text-status-danger-text text-[12px] font-medium pressable"
              @click="emptyRecycleBin"
            >
              清空回收站
            </button>
            <button type="button" class="icon-btn-white" @click="showRecycleSheet = false">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto no-scrollbar relative">
          <Transition name="skeleton-dissolve">
            <div v-if="loadingRecycle" class="absolute inset-0 z-10 bg-white space-y-2.5 pointer-events-none">
              <div v-for="i in 3" :key="i" class="skeleton-box h-[66px] w-full rounded-2xl" />
            </div>
          </Transition>
          <div v-if="deletedOrders.length" class="space-y-2.5">
            <div v-for="o in deletedOrders" :key="o.id" class="bg-canvas rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div class="text-[14px] font-medium text-ink">{{ o.clientName }} · {{ o.serviceType }}</div>
                <div class="text-[11px] text-ink-muted tabular-nums">{{ o.serviceDate }} · ¥{{ o.totalAmount }}</div>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="icon-btn-white text-status-locked-text"
                  aria-label="恢复订单"
                  @click="restoreOrder(o.id)"
                >
                  <RotateCcw class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="icon-btn-white text-status-danger-text"
                  aria-label="彻底删除"
                  @click="permanentDelete(o.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div v-else-if="!loadingRecycle" class="h-full flex items-center justify-center py-6">
            <CuteEmptyState
              variant="recycle"
              title="回收站干干净净"
              description="误删的行程会在这里安静保留 30 天，随时可以一键恢复"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <!-- Sheet: Change Login Password -->
    <van-popup v-model:show="showPasswordSheet" position="bottom" teleport="body" round>
      <div class="p-5 pb-safe-sheet space-y-4">
        <div class="sheet-grabber" />
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[17px] font-semibold text-ink">修改登录密码</h3>
            <p class="text-[11.5px] text-ink-muted mt-0.5">修改后其他已登录设备将自动安全退出</p>
          </div>
          <button type="button" class="icon-btn-white" @click="showPasswordSheet = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">当前原密码</label>
            <input
              v-model="pwdForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              class="w-full input-silk px-3.5 h-[42px]"
            />
          </div>
          <div>
            <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">设置新密码</label>
            <input
              v-model="pwdForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少 6 位）"
              class="w-full input-silk px-3.5 h-[42px]"
            />
          </div>
        </div>

        <button
          type="button"
          :disabled="savingPwd"
          class="btn-unified w-full btn-rose text-white disabled:opacity-60"
          @click="submitChangePassword"
        >
          {{ savingPwd ? '更新中...' : '确认更新密码' }}
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showConfirmDialog, showToast } from 'vant';
import {
  Camera,
  ChevronRight,
  Copy,
  KeyRound,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-vue-next';
import http, { API_BASE_URL } from '@/api/http';
import { isFirebaseMode } from '@/lib/firebase';
import { buildAllOrdersIcs } from '@/api/firebaseBackend';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { statusMeta } from '@/utils/format';
import {
  IconCalendarSync,
  IconCosmeticCase,
  IconLipstick,
  IconLoveNote,
  IconPosterCard,
  IconSilkLink,
  IconVanityMirror,
} from '@/components/icons/BeautyIcons';
import CuteEmptyState from '@/components/CuteEmptyState.vue';
import PriceListPosterModal from '@/components/PriceListPosterModal.vue';
import StudioAvatar from '@/components/StudioAvatar.vue';
import type { ClientItem, Order, PackageTemplate, UserSession } from '@/types';

const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

// Time-aware playful greeting for hero card
const timeGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨出妆辛苦啦 · 星光伴你同行';
  if (hour < 11) return '早安主理人 · 今天也要元气开妆';
  if (hour < 14) return '午间小憩 · 给灵感充点甜';
  if (hour < 18) return '午后柔光 · 每一笔都恰到好处';
  return '夜色温柔 · 好梦留给明日新娘';
});

const avatarPresets = [
  { id: 'preset:ribbon', label: '丝带结' },
  { id: 'preset:crown', label: '珍珠冠' },
  { id: 'preset:tulip', label: '郁金香' },
  { id: 'preset:butterfly', label: '粉蝶梦' },
];

const playfulQuotes = [
  '每一笔粉黛，都是双向奔赴的浪漫 ✨',
  '今天也要把新娘画成在逃公主 👑',
  '早起化妆很困，但看到你笑就值得 🌷',
  '手里有刷子，眼里有星光 💫',
  '慢慢变美，档期留给最懂你的人 🎀',
];

// Profile Card Editor
const showProfileEditor = ref(false);
const savingProfile = ref(false);
const uploadingAvatar = ref(false);
const profileForm = reactive({
  studioName: '',
  phone: '',
  avatarUrl: null as string | null,
  bio: '',
});

function openProfileEditor() {
  profileForm.studioName = auth.user?.studioName || '嘻嘻化妆室';
  profileForm.phone = auth.user?.phone || '';
  profileForm.avatarUrl = auth.user?.avatarUrl || null;
  profileForm.bio = auth.user?.bio || '每一笔粉黛，都是双向奔赴的浪漫 ✨';
  showProfileEditor.value = true;
}

async function onAvatarFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploadingAvatar.value = true;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await http.post('/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    profileForm.avatarUrl = data.url;
    showToast('头像已上传');
  } catch (err: any) {
    showToast(err?.response?.data?.error || '头像上传失败');
  } finally {
    uploadingAvatar.value = false;
    input.value = '';
  }
}

async function saveProfileCard() {
  if (!profileForm.studioName.trim()) {
    return showToast('请输入工作室或化妆师昵称');
  }
  savingProfile.value = true;
  try {
    await auth.updateProfile({
      studioName: profileForm.studioName.trim(),
      phone: profileForm.phone.trim() || null,
      avatarUrl: profileForm.avatarUrl,
      bio: profileForm.bio.trim() || '每一笔粉黛，都是双向奔赴的浪漫 ✨',
    });
    showProfileEditor.value = false;
    showToast('名片装扮已更新');
  } finally {
    savingProfile.value = false;
  }
}

// Packages
const showPackagesSheet = ref(false);
const showPricePoster = ref(false);
const loadingPackages = ref(false);

function openPricePoster() {
  showPricePoster.value = true;
}
const savingPkg = ref(false);
const packages = ref<PackageTemplate[]>([]);
const pkgFilter = ref<'ALL' | 'MAIN' | 'EXTRA'>('ALL');
const editingPkgId = ref<string | null>(null);
const newPkg = reactive({
  name: '',
  price: 0,
  category: 'MAIN' as 'MAIN' | 'EXTRA',
  durationHours: 6,
  description: '',
});

const packageFilterTabs = [
  { value: 'ALL' as const, label: '全部报价' },
  { value: 'MAIN' as const, label: '主套餐' },
  { value: 'EXTRA' as const, label: '增项服务' },
];

const filteredPackages = computed(() => {
  if (pkgFilter.value === 'ALL') return packages.value;
  return packages.value.filter((p) => p.category === pkgFilter.value);
});

function formatDurationLabel(mins: number) {
  if (!mins || mins <= 0) return '';
  const h = mins / 60;
  return Number.isInteger(h) ? `${h} 小时` : `${h.toFixed(1)} 小时`;
}

function resetPkgForm() {
  editingPkgId.value = null;
  newPkg.name = '';
  newPkg.price = 0;
  newPkg.category = 'MAIN';
  newPkg.durationHours = 6;
  newPkg.description = '';
}

function startEditPackage(pkg: PackageTemplate) {
  editingPkgId.value = pkg.id;
  newPkg.name = pkg.name;
  newPkg.price = pkg.price;
  newPkg.category = pkg.category;
  newPkg.durationHours = pkg.defaultDurationMin ? Number((pkg.defaultDurationMin / 60).toFixed(1)) : 0;
  newPkg.description = pkg.description || '';
}

function bookWithPackage(pkg: PackageTemplate) {
  showPackagesSheet.value = false;
  router.push({ path: '/orders/new', query: { packageId: pkg.id } });
}

async function copyFullPriceList() {
  const studio = auth.user?.studioName || '嘻嘻化妆室';
  const mains = packages.value.filter((p) => p.category === 'MAIN');
  const extras = packages.value.filter((p) => p.category === 'EXTRA');
  const lines: string[] = [`✨ 【${studio} · 妆造报价单】`];
  if (mains.length) {
    lines.push('', '🌸 主推妆造套餐');
    for (const p of mains) {
      const dur = p.defaultDurationMin ? `（约${formatDurationLabel(p.defaultDurationMin)}）` : '';
      lines.push(`· ${p.name}${dur}：¥${p.price}`);
      if (p.description) lines.push(`  ${p.description}`);
    }
  }
  if (extras.length) {
    lines.push('', '🌷 常用增项服务');
    for (const p of extras) {
      lines.push(`· ${p.name}：¥${p.price}${p.description ? `（${p.description}）` : ''}`);
    }
  }
  await copyText(lines.join('\n'), '已复制格式化报价单，可直接粘贴发微信');
}

// Clients
const showClientsSheet = ref(false);
const loadingClients = ref(false);
const clients = ref<ClientItem[]>([]);
const clientSearch = ref('');
const clientFilter = ref<'ALL' | 'PENDING_BALANCE' | 'REPEAT'>('ALL');
const expandedClientIds = ref<Set<string>>(new Set());

const clientFilterTabs = [
  { value: 'ALL' as const, label: '全部新娘' },
  { value: 'PENDING_BALANCE' as const, label: '有待收尾款' },
  { value: 'REPEAT' as const, label: '多单回头客' },
];

const filteredClients = computed(() => {
  const q = clientSearch.value.trim().toLowerCase();
  return clients.value.filter((c) => {
    if (clientFilter.value === 'PENDING_BALANCE' && !(c.pendingBalance && c.pendingBalance > 0)) return false;
    if (clientFilter.value === 'REPEAT' && (c.orderCount || 0) < 2) return false;
    if (!q) return true;
    return [c.name, c.phone, c.wechat, c.skinType, c.allergyNote, c.hairNote, c.source]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
});

function toggleClientExpand(id: string) {
  const next = new Set(expandedClientIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedClientIds.value = next;
}

function jumpToOrder(orderId: string) {
  showClientsSheet.value = false;
  router.push(`/orders/${orderId}`);
}

const showEditClientSheet = ref(false);
const savingClient = ref(false);
const editClientForm = reactive({
  id: '',
  name: '',
  phone: '',
  wechat: '',
  source: '',
  skinType: '',
  hairNote: '',
  allergyNote: '',
});

function openEditClient(c: ClientItem) {
  editClientForm.id = c.id;
  editClientForm.name = c.name || '';
  editClientForm.phone = c.phone || '';
  editClientForm.wechat = c.wechat || '';
  editClientForm.source = c.source || '';
  editClientForm.skinType = c.skinType || '';
  editClientForm.hairNote = c.hairNote || '';
  editClientForm.allergyNote = c.allergyNote || '';
  showEditClientSheet.value = true;
}

async function saveClientEdit() {
  if (!editClientForm.name.trim()) return showToast('请填写客户姓名');
  savingClient.value = true;
  try {
    const { data } = await http.put(`/clients/${editClientForm.id}`, {
      name: editClientForm.name.trim(),
      phone: editClientForm.phone.trim() || null,
      wechat: editClientForm.wechat.trim() || null,
      source: editClientForm.source.trim() || null,
      skinType: editClientForm.skinType.trim() || null,
      hairNote: editClientForm.hairNote.trim() || null,
      allergyNote: editClientForm.allergyNote.trim() || null,
    });
    const idx = clients.value.findIndex((c) => c.id === editClientForm.id);
    if (idx !== -1) {
      clients.value[idx] = { ...clients.value[idx], ...data.client };
    }
    showEditClientSheet.value = false;
    showToast('客户档案已保存');
  } finally {
    savingClient.value = false;
  }
}

async function deleteClientArchive(c: ClientItem) {
  try {
    await showConfirmDialog({
      title: '删除客户档案',
      message: `确认移除「${c.name}」的档案记录吗？（已排订单本身不会被删除）`,
      confirmButtonText: '确认删除',
      confirmButtonColor: '#C67A89',
    });
    await http.delete(`/clients/${c.id}`);
    clients.value = clients.value.filter((item) => item.id !== c.id);
    showToast('档案已移除');
  } catch {
    // cancelled
  }
}

async function copyText(text: string, successMsg: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    showToast(text);
  }
}

const showChecklistSheet = ref(false);
const checklistText = ref('');

const showNoticeSheet = ref(false);
const noticeText = ref('');

const showSessionsSheet = ref(false);
const loadingSessions = ref(false);
const sessions = ref<UserSession[]>([]);

const showRecycleSheet = ref(false);
const loadingRecycle = ref(false);
const deletedOrders = ref<Order[]>([]);

// Password Sheet & Logout
const showPasswordSheet = ref(false);
const savingPwd = ref(false);
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
});

function openPasswordSheet() {
  pwdForm.oldPassword = '';
  pwdForm.newPassword = '';
  showPasswordSheet.value = true;
}

async function submitChangePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    return showToast('请填写原密码与新密码');
  }
  if (pwdForm.newPassword.length < 6) {
    return showToast('新密码至少需要 6 位');
  }
  savingPwd.value = true;
  try {
    await http.post('/auth/change-password', pwdForm);
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    showPasswordSheet.value = false;
    showToast('密码已更新');
  } catch (err: any) {
    showToast(err?.response?.data?.error || '密码修改失败');
  } finally {
    savingPwd.value = false;
  }
}

async function handleLogout() {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      confirmButtonColor: '#C67A89',
    });
    await auth.logout();
    router.replace('/login');
  } catch {
    // cancelled
  }
}

async function openPackages() {
  showPackagesSheet.value = true;
  loadingPackages.value = true;
  try {
    const { data } = await http.get('/packages');
    packages.value = data.packages || [];
  } finally {
    loadingPackages.value = false;
  }
}

async function savePackage() {
  if (!newPkg.name) return showToast('请填写套餐名称');
  savingPkg.value = true;
  try {
    const payload = {
      name: newPkg.name,
      price: Number(newPkg.price) || 0,
      category: newPkg.category,
      defaultDurationMin: Math.max(0, Math.round((Number(newPkg.durationHours) || 0) * 60)),
      description: newPkg.description || '',
    };
    if (editingPkgId.value) {
      const { data } = await http.put(`/packages/${editingPkgId.value}`, payload);
      const idx = packages.value.findIndex((p) => p.id === editingPkgId.value);
      if (idx !== -1) packages.value[idx] = data.package;
      showToast('套餐已更新');
    } else {
      const { data } = await http.post('/packages', payload);
      packages.value.push(data.package);
      showToast('套餐已添加');
    }
    resetPkgForm();
  } finally {
    savingPkg.value = false;
  }
}

async function deletePackage(id: string) {
  await http.delete(`/packages/${id}`);
  packages.value = packages.value.filter((p) => p.id !== id);
  if (editingPkgId.value === id) resetPkgForm();
  showToast('已删除');
}

async function openClients() {
  showClientsSheet.value = true;
  loadingClients.value = true;
  try {
    const { data } = await http.get('/clients');
    clients.value = data.clients || [];
  } finally {
    loadingClients.value = false;
  }
}

function openChecklistTpl() {
  checklistText.value = (auth.user?.checklistTemplate || []).join('\n');
  showChecklistSheet.value = true;
}

async function saveChecklistTpl() {
  const list = checklistText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  await auth.updateProfile({ checklistTemplate: list });
  showChecklistSheet.value = false;
  showToast('清单模板已保存');
}

function openNoticeTpl() {
  noticeText.value = auth.user?.noticeTemplate || '';
  showNoticeSheet.value = true;
}

async function saveNoticeTpl() {
  await auth.updateProfile({ noticeTemplate: noticeText.value });
  showNoticeSheet.value = false;
  showToast('妆前贴士已保存');
}

async function copyPublicSchedule() {
  const url = `${window.location.origin}/s/${auth.user?.shareToken}`;
  await copyText(url, '已复制脱敏档期链接');
}

function previewPublicSchedule() {
  if (auth.user?.shareToken) {
    router.push(`/s/${auth.user.shareToken}`);
  }
}

async function copyIcsLink() {
  if (isFirebaseMode) {
    try {
      const ics = await buildAllOrdersIcs();
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `晴记档期-${auth.user?.studioName || '嘻嘻化妆室'}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('已导出日历文件，可直接导入 iPhone 日历');
    } catch {
      showToast('导出日历失败');
    }
    return;
  }
  const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : `${window.location.origin}${API_BASE_URL}`;
  const url = `${base}/public/calendar/${auth.user?.shareToken}.ics`;
  await copyText(url, '已复制 iPhone 日历订阅链接');
}

async function openSessions() {
  showSessionsSheet.value = true;
  loadingSessions.value = true;
  try {
    const { data } = await http.get('/auth/sessions');
    sessions.value = data.sessions || [];
  } finally {
    loadingSessions.value = false;
  }
}

async function kickSession(id: string) {
  await http.delete(`/auth/sessions/${id}`);
  sessions.value = sessions.value.filter((s) => s.id !== id);
  showToast('已移除该设备');
}

async function openRecycleBin() {
  showRecycleSheet.value = true;
  loadingRecycle.value = true;
  try {
    const { data } = await http.get('/orders', { params: { deleted: 'true' } });
    deletedOrders.value = data.orders || [];
  } finally {
    loadingRecycle.value = false;
  }
}

async function restoreOrder(id: string) {
  await http.post(`/orders/${id}/restore`);
  deletedOrders.value = deletedOrders.value.filter((o) => o.id !== id);
  showToast('行程已恢复');
}

async function permanentDelete(id: string) {
  await http.delete(`/orders/${id}?permanent=true`);
  deletedOrders.value = deletedOrders.value.filter((o) => o.id !== id);
  showToast('已彻底删除');
}

async function emptyRecycleBin() {
  try {
    await showConfirmDialog({
      title: '清空回收站',
      message: `将永久删除这 ${deletedOrders.value.length} 条行程，并自动清理无关联订单的客户档案，无法恢复。`,
      confirmButtonText: '确认清空',
      confirmButtonColor: '#C67A89',
    });
    await http.delete('/orders/trash/empty');
    deletedOrders.value = [];
    showToast('回收站已清空');
  } catch {
    // cancelled
  }
}
</script>

<style scoped>
.hero-studio-card {
  border-radius: 28px;
  padding: 20px;
  background: linear-gradient(
    140deg,
    rgba(254, 245, 248, 0.96) 0%,
    rgba(255, 255, 255, 0.94) 52%,
    rgba(252, 244, 239, 0.94) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow:
    0 12px 30px -16px rgba(185, 128, 146, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.hero-orb {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(22px);
}
.hero-orb-1 {
  width: 140px;
  height: 140px;
  top: -46px;
  right: -24px;
  background: radial-gradient(circle, rgba(242, 198, 212, 0.45) 0%, rgba(242, 198, 212, 0) 70%);
}
.hero-orb-2 {
  width: 120px;
  height: 120px;
  bottom: -48px;
  left: 16px;
  background: radial-gradient(circle, rgba(246, 224, 206, 0.42) 0%, rgba(246, 224, 206, 0) 70%);
}
.avatar-ring {
  padding: 3px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #F3D1DC 0%, #FFFFFF 52%, #ECD1C5 100%);
  box-shadow: 0 8px 18px -8px rgba(188, 126, 146, 0.42);
}
.menu-row {
  @apply w-full px-2.5 py-3 rounded-[16px] flex items-center justify-between text-[14px] text-ink active:bg-brand-soft/45 transition-colors;
}
.icon-squircle {
  @apply w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0;
}
</style>
