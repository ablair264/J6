import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogCloseIcon,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from '@/components/ui/dialog';

const font = "'Inter', system-ui, sans-serif";

/** Dialog example — dark modal with simple action row. */
export function DialogTriggerDark() {
  return (
    <DialogTrigger>
      <Button
        className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 bg-[#1e1e22] hover:bg-[#1e1e22] text-[#e2e8f0]"
        style={{
          borderColor: '#303035',
          fontFamily: font,
        }}
      >
        Open Dialog
      </Button>
      <ModalOverlay isDismissable className="bg-black/60">
        <Modal className="max-w-[420px]">
          <Dialog className="rounded-2xl border border-white/10 bg-[#141416] text-[#f0ede8] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
            <DialogHeader
              title="Publish changes"
              description="Review the final details before making this version available to your team."
              className="text-left"
            />
            <DialogCloseIcon isDismissable className="text-[#9a9aa3]" />
            <DialogBody className="space-y-3 pb-0 text-sm text-[#b6b2aa]">
              <p>Version 2.1 will replace the current production draft.</p>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[#e2e8f0]">
                Includes new tokens, cleaned spacing scale, and updated button states.
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose
                intent="plain"
                className="border border-white/10 bg-transparent text-[#9a9aa3] hover:bg-white/[0.06] hover:text-[#f0ede8]"
                style={{ fontFamily: font }}
              >
                Cancel
              </DialogClose>
              <DialogClose
                intent="primary"
                className="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white"
                style={{ fontFamily: font }}
              >
                Publish
              </DialogClose>
            </DialogFooter>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

/** Dialog example — amber confirmation with supportive copy. */
export function DialogTriggerAmber() {
  return (
    <DialogTrigger>
      <Button
        className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]"
        style={{
          borderColor: 'rgba(196, 128, 10, 0.4)',
          fontFamily: font,
        }}
      >
        Confirm Action
      </Button>
      <ModalOverlay isDismissable className="bg-[rgba(10,10,11,0.72)] backdrop-blur-md">
        <Modal className="max-w-[440px]">
          <Dialog className="rounded-[24px] border border-[#f5a623]/25 bg-[linear-gradient(180deg,#1a1a1d_0%,#141416_100%)] text-[#f0ede8] shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
            <DialogHeader
              title="Start migration?"
              description="This will queue a schema migration and notify collaborators when the new build is ready."
              className="text-left"
            />
            <DialogCloseIcon isDismissable className="text-[#b89d62]" />
            <DialogBody className="space-y-4 pb-0 text-sm text-[#c9c3b8]">
              <div className="rounded-2xl border border-[#f5a623]/20 bg-[#f5a623]/8 px-4 py-3">
                Estimated duration: 4 minutes. No downtime is expected during rollout.
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose
                intent="plain"
                className="border border-white/10 bg-transparent text-[#9a9aa3] hover:bg-white/[0.06] hover:text-[#f0ede8]"
                style={{ fontFamily: font }}
              >
                Not now
              </DialogClose>
              <DialogClose
                intent="primary"
                className="bg-[#f5a623] hover:bg-[#ffba4a] text-[#1a1a1d]"
                style={{ fontFamily: font }}
              >
                Start migration
              </DialogClose>
            </DialogFooter>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

/** Dialog example — destructive confirmation with clear warning. */
export function DialogTriggerDestructive() {
  return (
    <DialogTrigger>
      <Button
        className="rounded-lg border border-solid text-sm font-medium text-center justify-center h-10 px-5 bg-[#e11d48] hover:bg-[#be123c] text-white"
        style={{
          borderColor: 'rgba(190, 18, 60, 0.4)',
          fontFamily: font,
        }}
      >
        Delete Item
      </Button>
      <ModalOverlay isDismissable className="bg-[rgba(12,4,8,0.76)] backdrop-blur-sm">
        <Modal className="max-w-[420px]">
          <Dialog className="rounded-2xl border border-[#fb7185]/20 bg-[#160c10] text-[#ffe4ea] shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <DialogHeader
              title="Delete this workspace?"
              description="This action cannot be undone. All drafts, comments, and uploads will be permanently removed."
              className="text-left"
            />
            <DialogCloseIcon isDismissable className="text-[#fda4af]" />
            <DialogBody className="space-y-3 pb-0 text-sm text-[#f9a8b5]">
              <div className="rounded-xl border border-[#fb7185]/15 bg-[#fb7185]/8 px-4 py-3 text-[#fecdd3]">
                12 collaborators will lose access immediately.
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose
                intent="plain"
                className="border border-white/10 bg-transparent text-[#fda4af] hover:bg-white/[0.06] hover:text-white"
                style={{ fontFamily: font }}
              >
                Keep workspace
              </DialogClose>
              <DialogClose
                intent="danger"
                className="bg-[#e11d48] hover:bg-[#be123c] text-white"
                style={{ fontFamily: font }}
              >
                Delete forever
              </DialogClose>
            </DialogFooter>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
