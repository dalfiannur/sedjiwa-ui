import { useState } from "react";
import {
  Button, Badge, Avatar, AvatarFallback, AvatarImage,
  Input, Label, Separator, Skeleton,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
  Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Toaster,
  DataTable, type Column,
  Modal,
} from "@qyubit/sedjiwa-ui";

const buttonVariants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
const badgeVariants = ["default", "secondary", "destructive", "outline"] as const;

export function Playground() {
  const [tab, setTab] = useState("buttons");

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">sedjiwa-ui playground</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toggle <code className="font-mono">.dark</code> on{" "}
          <code className="font-mono">&lt;html&gt;</code> in devtools to preview dark mode.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="composed">Composed</TabsTrigger>
          <TabsTrigger value="misc">Misc</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Button variants</h2>
            <div className="flex flex-wrap gap-3">
              {buttonVariants.map((v) => (
                <Button key={v} variant={v}>{v}</Button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Button — loading state</h2>
            <div className="flex flex-wrap gap-3">
              <Button loading>Saving…</Button>
              <Button variant="destructive" loading>Deleting…</Button>
              <Button variant="outline" loading>Loading</Button>
              <Button variant="secondary" loading>Loading</Button>
              <Button variant="ghost" loading>Loading</Button>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Button — pressed (toggle) state</h2>
            <ToggleButtonRow />
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Badge variants</h2>
            <div className="flex flex-wrap gap-3">
              {badgeVariants.map((v) => (
                <Badge key={v} variant={v}>{v}</Badge>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6 pt-4">
          <section className="max-w-md space-y-3">
            <h2 className="text-lg font-medium">Input + Label</h2>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="ada@example.com" />
            </div>
          </section>
          <section className="max-w-md space-y-3">
            <h2 className="text-lg font-medium">Select</h2>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
              </SelectContent>
            </Select>
          </section>
        </TabsContent>

        <TabsContent value="overlays" className="space-y-6 pt-4">
          <section className="space-x-3">
            <Dialog>
              <DialogTrigger asChild><Button>Open Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hello</DialogTitle>
                  <DialogDescription>This is a dialog.</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Side panel</SheetTitle>
                  <SheetDescription>Slides in from the right.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="secondary">Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="ghost">Hover me</Button></TooltipTrigger>
                <TooltipContent>Tooltip content</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </section>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Table</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Ada</TableCell>
                  <TableCell>Engineer</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Grace</TableCell>
                  <TableCell>Designer</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Breadcrumb</h2>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/team">Team</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </section>
        </TabsContent>

        <TabsContent value="composed" className="space-y-8 pt-4">
          <ComposedShowcase />
        </TabsContent>

        <TabsContent value="misc" className="space-y-6 pt-4">
          <section>
            <h2 className="text-lg font-medium mb-3">Avatar</h2>
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="Ada" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>GH</AvatarFallback>
              </Avatar>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-medium mb-3">Skeleton</h2>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </section>
          <section className="max-w-md">
            <h2 className="text-lg font-medium mb-3">Separator</h2>
            <p>Above</p>
            <Separator className="my-3" />
            <p>Below</p>
          </section>
        </TabsContent>
      </Tabs>

      <Toaster />
    </main>
  );
}

type DemoPerson = { id: string; name: string; role: string; salary: number };

const PEOPLE: DemoPerson[] = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", salary: 95000 },
  { id: "2", name: "Grace Hopper", role: "Designer", salary: 88000 },
  { id: "3", name: "Margaret Hamilton", role: "Director", salary: 120000 },
];

const PERSON_COLUMNS: Column<DemoPerson>[] = [
  { key: "name", header: "Name", render: (p) => p.name },
  { key: "role", header: "Role", render: (p) => p.role },
  {
    key: "salary",
    header: "Salary",
    align: "right",
    render: (p) => `$${p.salary.toLocaleString("en-US")}`,
  },
];

function ComposedShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg" | "xl">("md");

  return (
    <>
      <section className="space-y-4">
        <h2 className="text-lg font-medium">DataTable</h2>
        <DataTable
          columns={PERSON_COLUMNS}
          rows={PEOPLE}
          getRowKey={(p) => p.id}
          renderAction={(p) => (
            <Button size="sm" variant="ghost">
              Edit {p.name.split(" ")[0]}
            </Button>
          )}
          onRowClick={(p) => {
            console.log("row clicked:", p.name);
          }}
        />

        <h3 className="text-sm font-medium pt-4">Empty state</h3>
        <DataTable
          columns={PERSON_COLUMNS}
          rows={[]}
          getRowKey={(p) => p.id}
          emptyMessage="No people found"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Modal</h2>
        <div className="flex flex-wrap items-center gap-3">
          {(["sm", "md", "lg", "xl"] as const).map((s) => (
            <Button
              key={s}
              variant="outline"
              onClick={() => {
                setSize(s);
                setModalOpen(true);
              }}
            >
              Open {s}
            </Button>
          ))}
        </div>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={`Modal — size ${size}`}
          description="A composed convenience layer over Dialog. Press Escape or click the backdrop to close."
          size={size}
        >
          <p className="text-sm text-muted-foreground">
            Modal body. Replace with whatever the consumer needs — forms,
            confirmations, embedded flows.
          </p>
        </Modal>
      </section>
    </>
  );
}

function ToggleButtonRow() {
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const variants = ["default", "outline", "secondary", "ghost", "link"] as const;
  return (
    <div className="flex flex-wrap gap-3">
      {variants.map((v) => (
        <Button
          key={v}
          variant={v}
          pressed={!!pressed[v]}
          onClick={() => setPressed((p) => ({ ...p, [v]: !p[v] }))}
        >
          {v} {pressed[v] ? "(on)" : "(off)"}
        </Button>
      ))}
    </div>
  );
}
