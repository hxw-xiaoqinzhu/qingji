<template>
  <div class="h-full flex flex-col silk-mesh-bg overflow-hidden">
    <!-- Adaptive Top Header -->
    <header class="nav-adaptive px-4 pb-3 flex items-center justify-between" :style="headerStyle">
      <button
        type="button"
        class="ios27-icon-btn"
        aria-label="返回"
        @click="router.back()"
      >
        <ChevronLeft class="w-[17px] h-[17px]" />
      </button>
      <h1 class="text-[17px] font-semibold text-ink">工作室设置</h1>
      <div class="w-[34px]" />
    </header>

    <!-- Scrollable Settings Cards -->
    <div class="scroll-pane no-scrollbar px-4 pt-2 pb-safe-sheet space-y-4" @scroll.passive="onPaneScroll">
      <!-- Card 1: Basic Studio Identity -->
      <section class="card-soft p-5 space-y-4 stagger-item">
        <div class="flex items-center gap-3.5 pb-1">
          <div class="p-[2.5px] rounded-full shrink-0" style="background: linear-gradient(135deg, #F3D1DC 0%, #FFFFFF 52%, #ECD1C5 100%); box-shadow: 0 6px 14px -6px rgba(188, 126, 146, 0.4)">
            <StudioAvatar :src="auth.user?.avatarUrl" :size="48" rounded-class="rounded-full" />
          </div>
          <div>
            <h2 class="text-[15px] font-semibold text-ink">化妆室资料</h2>
            <p class="text-[12px] text-ink-muted mt-0.5">显示在首页海报、预约确认函与公开档期页</p>
          </div>
        </div>

        <div>
          <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">化妆室名称</label>
          <input
            v-model.trim="studioForm.studioName"
            type="text"
            placeholder="如：嘻嘻化妆室"
            class="w-full input-silk px-3.5 h-[42px]"
          />
        </div>

        <div>
          <label class="block text-[12px] text-ink-secondary mb-1.5 font-medium">对外联系电话（选填）</label>
          <input
            v-model.trim="studioForm.phone"
            type="tel"
            placeholder="用于客户联系沟通"
            class="w-full input-silk px-3.5 h-[42px] tabular-nums"
          />
        </div>

        <button
          type="button"
          :disabled="savingProfile"
          class="btn-unified w-full btn-rose text-white disabled:opacity-60"
          @click="saveStudio"
        >
          {{ savingProfile ? '保存中...' : '保存化妆室资料' }}
        </button>
      </section>

      <!-- Card 2: Password Security -->
      <section class="card-soft p-5 space-y-3.5 stagger-item" style="--stagger: 1">
        <div>
          <h2 class="text-[15px] font-semibold text-ink">修改登录密码</h2>
          <p class="text-[12px] text-ink-muted mt-0.5">定期更新密码可保障多端档期数据安全</p>
        </div>

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

        <button
          type="button"
          :disabled="savingPwd"
          class="btn-unified w-full btn-glass !text-brand-deep disabled:opacity-60"
          @click="changePassword"
        >
          {{ savingPwd ? '更新中...' : '更新登录密码' }}
        </button>
      </section>

      <!-- Card 3: Logout -->
      <div class="pt-1 pb-4 stagger-item" style="--stagger: 2">
        <button
          type="button"
          class="btn-unified btn-glass w-full !text-status-danger-text"
          @click="handleLogout"
        >
          退出当前账号
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { ChevronLeft } from 'lucide-vue-next';
import http from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useScrollHeader } from '@/composables/useScrollHeader';
import StudioAvatar from '@/components/StudioAvatar.vue';

const router = useRouter();
const auth = useAuthStore();
const { onPaneScroll, headerStyle } = useScrollHeader(44);

const savingProfile = ref(false);
const savingPwd = ref(false);

const studioForm = reactive({
  studioName: '嘻嘻化妆室',
  phone: '',
});

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
});

onMounted(() => {
  studioForm.studioName = auth.user?.studioName || '嘻嘻化妆室';
  studioForm.phone = auth.user?.phone || '';
});

async function saveStudio() {
  if (!studioForm.studioName) {
    showToast('请填写化妆室名称');
    return;
  }
  savingProfile.value = true;
  try {
    await auth.updateProfile({
      studioName: studioForm.studioName,
      phone: studioForm.phone || null,
    });
    showToast('化妆室资料已保存');
  } catch {
    showToast('保存失败');
  } finally {
    savingProfile.value = false;
  }
}

async function changePassword() {
  if (!pwdForm.oldPassword || !pwdForm.newPassword) {
    showToast('请填写原密码与新密码');
    return;
  }
  savingPwd.value = true;
  try {
    await http.post('/auth/change-password', pwdForm);
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
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
      confirmButtonColor: '#DC99AA',
    });
    await auth.logout();
    router.replace('/login');
  } catch {
    // cancelled
  }
}
</script>
