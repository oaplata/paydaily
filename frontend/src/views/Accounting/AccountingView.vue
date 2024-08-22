<template>
  <div>
    <h1 class="mb-4">Contabildad</h1>
    <v-form>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            density="compact"
            label="Cuidad"
            :items="cities"
            item-title="name"
            item-value="value"
            variant="outlined"
            hide-details
            v-model="currentCity"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            density="compact"
            label="Año"
            :items="years"
            item-title="name"
            item-value="value"
            variant="outlined"
            hide-details
            v-model="currentYear"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            density="compact"
            label="Mes"
            :items="months"
            item-title="name"
            item-value="value"
            variant="outlined"
            hide-details
            v-model="currentMonth"
          ></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" block @click="getAccounting" :disabled="isDisabled">Consultar</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <br><br><br>
    <template v-if="users.length">
      <h2>Cobrado</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.fees.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.fees.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Calle</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.calle.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.calle.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Rifa</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.rifa.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.rifa.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Renovacion</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.renovacion.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.renovacion.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Mora</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.mora.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.mora.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Prestamo</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.prestamo.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.prestamo.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Gasto</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.gasto.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.gasto.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <br><br><br>
      <h2>Efectivo</h2>
      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Fecha
            </th>
            <th class="text-left" v-for="user of users" :key="user.id">
              {{ user.name }}            
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="day of days" :key="day.day">
            <td>{{ day.day }}</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.efectivo.filter(fee => fee.date >= day.dateStart && fee.date <= day.dateEnd).reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td v-for="user of users" :key="user.id">
              {{
                formatMoney(user.efectivo.reduce((acc, fee) => acc + fee.value, 0))
              }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>
  </div>
</template>
<script setup>
// 'Calle', 'Rifa', 'Renovacion', 'Mora', 'Prestamo', 'Gasto', 'Efectivo', 'loanFee'
import { getUserBalance, getUsersByCity } from '@/api/users';
import { currentCompany } from '@/composables/useCurrentCompany';
import { ref, onMounted, computed } from 'vue'

const cities = [
  { name: "Bucaramanga", value: "Bucaramanga" },
  { name: "Santa Marta", value: "Santa Marta" },
]

const years = [
  { name: "2024", value: "2024" },
  { name: "2025", value: "2025" },
  { name: "2026", value: "2026" },
  { name: "2027", value: "2027" },
  { name: "2028", value: "2028" },
  { name: "2029", value: "2029" },
  { name: "2030", value: "2030" },
]

const months = [
  { name: "Enero", value: "Enero" },
  { name: "Febrero", value: "Febrero" },
  { name: "Marzo", value: "Marzo" },
  { name: "Abril", value: "Abril" },
  { name: "Mayo", value: "Mayo" },
  { name: "Junio", value: "Junio" },
  { name: "Julio", value: "Julio" },
  { name: "Agosto", value: "Agosto" },
  { name: "Septiembre", value: "Septiembre" },
  { name: "Octubre", value: "Octubre" },
  { name: "Noviembre", value: "Noviembre" },
  { name: "Diciembre", value: "Diciembre" },
]

const currentCity = ref('Santa Marta');
const currentYear = ref(null)
const currentMonth = ref(null)

const users = ref([])
const days = ref([])

const isDisabled = computed(() => {
  return !currentCity.value || !currentYear.value || !currentMonth.value
})

const getAccounting = async () => {
  users.value = []
  days.value = []
  const usersFirebase = await getUsersByCity({ companyId: currentCompany.value.id, city: currentCity.value })

  const startDate = new Date(
    new Date(
      new Date().setFullYear(currentYear.value, months.findIndex(month => month.value === currentMonth.value), 1)
    ).setHours(0, 0, 0, 0)
  )
  const endDate = new Date(
    new Date(
      new Date().setFullYear(currentYear.value, months.findIndex(month => month.value === currentMonth.value) + 1, 0)
    ).setHours(23, 59, 59, 999)
  )

  // fill days array with the days of the month
  for (let i = 1; i <= new Date(currentYear.value, months.findIndex(month => month.value === currentMonth.value) + 1, 0).getDate(); i++) {
    days.value.push({
      dateStart: new Date(
        new Date(
          new Date().setFullYear(currentYear.value, months.findIndex(month => month.value === currentMonth.value), i)
        ).setHours(0, 0, 0, 0)
      ),
      dateEnd: new Date(
        new Date(
          new Date().setFullYear(currentYear.value, months.findIndex(month => month.value === currentMonth.value), i)
        ).setHours(23, 59, 59, 999)
      ),
      day: `${i < 10 ? '0' + i : i} de ${currentMonth.value}`
    })
  }

  await Promise.all(usersFirebase.map(async user => {
    user.balances = await getUserBalance({ userId: user.id, endDate, startDate })
    user.balances = user.balances.map(b => ({ ...b, date: new Date(b.createdAt.seconds * 1000) }))
    user.fees = user.balances.filter(balance => balance.type === 'loanFee')
    user.calle = user.balances.filter(balance => balance.type === 'Calle')
    user.rifa = user.balances.filter(balance => balance.type === 'Rifa')
    user.renovacion = user.balances.filter(balance => balance.type === 'Renovacion')
    user.mora = user.balances.filter(balance => balance.type === 'Mora')
    user.prestamo = user.balances.filter(balance => balance.type === 'Prestamo')
    user.gasto = user.balances.filter(balance => balance.type === 'Gasto')
    user.efectivo = user.balances.filter(balance => balance.type === 'Efectivo')
  }))

  users.value = usersFirebase
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}


onMounted(() => {
  currentYear.value = new Date().getFullYear()
  currentMonth.value = months[new Date().getMonth()].value
})


</script>
